package com.faculte.gestion_ressources.service.impl;

import com.faculte.gestion_ressources.dto.request.ConstatRequest;
import com.faculte.gestion_ressources.dto.request.DecisionRequest;
import com.faculte.gestion_ressources.dto.request.PanneRequest;
import com.faculte.gestion_ressources.dto.request.PanneStatusRequest;
import com.faculte.gestion_ressources.dto.response.PanneResponse;
import com.faculte.gestion_ressources.entity.*;
import com.faculte.gestion_ressources.enums.*;
import com.faculte.gestion_ressources.exception.AppException;
import com.faculte.gestion_ressources.mapper.PanneMapper;
import com.faculte.gestion_ressources.mapper.ConstatMapper;
import com.faculte.gestion_ressources.repository.*;
import com.faculte.gestion_ressources.service.NotificationService;
import com.faculte.gestion_ressources.service.PanneService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PanneServiceImpl implements PanneService {

    private final PanneRepository panneRepository;
    private final ConstatRepository constatRepository;
    private final RessourceRepository ressourceRepository;
    private final UserRepository userRepository;
    private final AffectationRepository affectationRepository;
    private final PanneMapper panneMapper;
    private final ConstatMapper constatMapper;
    private final NotificationService notificationService;

    // ──────────────────────────────────────────────────────────────────────
    // 1. Enseignant signale une panne  →  statut = OUVERTE
    // ──────────────────────────────────────────────────────────────────────
    @Override
    @Transactional
    public PanneResponse create(PanneRequest request, String signalerEmail) {
        User signaler = userRepository.findByEmail(signalerEmail)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé"));

        Ressource ressource = ressourceRepository.findById(request.getRessourceId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Ressource non trouvée"));

        boolean isAuthorized = signaler.getRole() == Role.RESPONSABLE;

        if (!isAuthorized) {
            // Ownership checks for non-responsible users only
            Affectation affectation = affectationRepository.findActiveByRessourceId(ressource.getId())
                    .orElseThrow(() -> new AppException(HttpStatus.FORBIDDEN, "Ressource non accessible par votre compte"));

            UUID affectationDepartementId = affectation.getDepartement() != null ? affectation.getDepartement().getId() : null;
            UUID signalerDepartementId = getUserDepartementId(signaler);

            if (signaler.getRole() == Role.ENSEIGNANT) {
                isAuthorized = affectation.getUtilisateur() != null
                        && Objects.equals(affectation.getUtilisateur().getId(), signaler.getId());
            } else if (signaler.getRole() == Role.CHEF_DEPT) {
                isAuthorized = Objects.equals(affectationDepartementId, signalerDepartementId);
            }
        }

        if (!isAuthorized) {
            throw new AppException(HttpStatus.FORBIDDEN, "Ressource non accessible par votre compte");
        }

        Panne panne = Panne.builder()
                .ressource(ressource)
                .signaledBy(signaler)
                .dateApparition(request.getDateApparition())
                .description(request.getDescription())
                .statut(StatutPanne.OUVERTE)
                .build();
        
        ressource.setEtat(EtatRessource.EN_PANNE);
        ressourceRepository.save(ressource);

        return panneMapper.toResponse(panneRepository.save(panne));
    }

    // ──────────────────────────────────────────────────────────────────────
    // 2. Technicien prend en charge la panne  →  statut = EN_COURS
    // ──────────────────────────────────────────────────────────────────────
    @Override
    @Transactional
    public PanneResponse prendreEnCharge(UUID id, String technicienEmail) {
        Panne panne = panneRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Panne non trouvée"));

        if (panne.getStatut() != StatutPanne.OUVERTE) {
            throw new AppException(HttpStatus.CONFLICT,
                    "Seule une panne OUVERTE peut être prise en charge. Statut actuel : " + panne.getStatut());
        }

        panne.setStatut(StatutPanne.EN_COURS);
        return enrichResponse(panneMapper.toResponse(panneRepository.save(panne)), panne);
    }

    // ──────────────────────────────────────────────────────────────────────
    // 3. Technicien résout directement (panne non sévère)  →  RESOLUE
    // ──────────────────────────────────────────────────────────────────────
    @Override
    @Transactional
    public PanneResponse resolveDirectly(UUID id, String technicienEmail) {
        Panne panne = panneRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Panne non trouvée"));

        User user = userRepository.findByEmail(technicienEmail)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé"));

        boolean isTech = user.getRole() == Role.TECHNICIEN;
        boolean isFourn = user.getRole() == Role.FOURNISSEUR;

        if (isTech && panne.getStatut() == StatutPanne.EN_COURS) {
            panne.setEstSevere(false);
        } else if (isFourn && panne.getStatut() == StatutPanne.ENVOYEE_FOURNISSEUR) {
            // OK
        } else {
            throw new AppException(HttpStatus.FORBIDDEN, 
                "Vous n'avez pas les droits pour résoudre cette panne. Statut actuel : " + panne.getStatut());
        }

        panne.setStatut(StatutPanne.RESOLUE);

        // Restaurer l'état de la ressource
        Ressource ressource = panne.getRessource();
        if (affectationRepository.findActiveByRessourceId(ressource.getId()).isPresent()) {
            ressource.setEtat(EtatRessource.AFFECTEE);
        } else {
            ressource.setEtat(EtatRessource.DISPONIBLE);
        }
        ressourceRepository.save(ressource);

        return enrichResponse(panneMapper.toResponse(panneRepository.save(panne)), panne);
    }

    // ──────────────────────────────────────────────────────────────────────
    // 4. Technicien rédige un constat (panne sévère)  →  CONSTATEE
    //    puis notification envoyée au responsable  →  EN_ATTENTE_DECISION
    // ──────────────────────────────────────────────────────────────────────
    @Override
    @Transactional
    public PanneResponse addConstat(UUID panneId, ConstatRequest request, String technicienEmail) {
        Panne panne = panneRepository.findById(panneId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Panne non trouvée"));

        if (panne.getStatut() != StatutPanne.EN_COURS) {
            throw new AppException(HttpStatus.CONFLICT,
                    "Un constat ne peut être ajouté que sur une panne EN_COURS. Statut actuel : " + panne.getStatut());
        }

        // Règle métier : les imprimantes ne peuvent avoir que des pannes MATERIEL
        if (panne.getRessource().getType() == TypeRessource.IMPRIMANTE
                && (request.getTypePanne() == TypePanne.LOGICIEL_SYSTEME
                    || request.getTypePanne() == TypePanne.LOGICIEL_UTILITAIRE)) {
            throw new AppException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Une imprimante ne peut avoir qu'une panne d'ordre matériel");
        }

        if (constatRepository.existsByPanneId(panneId)) {
            throw new AppException(HttpStatus.CONFLICT, "Un constat existe déjà pour cette panne");
        }

        User technicien = userRepository.findByEmail(technicienEmail)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Technicien non trouvé"));

        Constat constat = Constat.builder()
                .panne(panne)
                .technicien(technicien)
                .explication(request.getExplication())
                .frequence(request.getFrequence())
                .typePanne(request.getTypePanne())
                .dateConstat(LocalDate.now())
                .notificationEnvoyee(false)
                .build();
        
        constatRepository.save(constat);

        // Marquer la panne comme sévère et mettre à jour le statut
        panne.setEstSevere(true);
        panne.setStatut(StatutPanne.EN_ATTENTE_DECISION);
        panneRepository.save(panne);

        // Envoyer une notification au responsable des ressources
        List<User> allUsers = userRepository.findAll();
        allUsers.stream()
                .filter(u -> u.getRole() == Role.RESPONSABLE)
                .forEach(responsable -> {
                    Map<String, Object> payload = new HashMap<>();
                    payload.put("panneId", panneId.toString());
                    payload.put("codeInventaire", panne.getRessource().getCodeInventaire());
                    payload.put("explication", constat.getExplication());
                    payload.put("frequence", constat.getFrequence().name());
                    payload.put("typePanne", constat.getTypePanne().name());
                    payload.put("dateApparition", panne.getDateApparition().toString());
                    payload.put("technicien", technicien.getNom());

                    notificationService.send(responsable.getId(), NotificationType.CONSTAT_PANNE, payload);
                });
        constat.setNotificationEnvoyee(true);
        constatRepository.save(constat);

        PanneResponse response = panneMapper.toResponse(panne);
        response.setConstat(constatMapper.toResponse(constat));
        return response;
    }

    // ──────────────────────────────────────────────────────────────────────
    // 5. Responsable prend sa décision  →  ENVOYEE_FOURNISSEUR
    //    Notification envoyée au fournisseur dans les 2 cas
    // ──────────────────────────────────────────────────────────────────────
    @Override
    @Transactional
    public PanneResponse addDecision(UUID panneId, DecisionRequest request) {
        Panne panne = panneRepository.findById(panneId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Panne non trouvée"));

        if (panne.getStatut() != StatutPanne.EN_ATTENTE_DECISION) {
            throw new AppException(HttpStatus.CONFLICT,
                    "Une décision ne peut être prise que sur une panne EN_ATTENTE_DECISION. Statut actuel : " + panne.getStatut());
        }

        Constat constat = constatRepository.findByPanneId(panneId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Constat non trouvé. Décision impossible."));

        Ressource ressource = panne.getRessource();
        Offre offre = ressource.getOffre();

        // Enregistrer la décision

        // Enregistrer la décision
        // Règle métier : Le CHANGEMENT est strictement interdit hors garantie.
        // La RÉPARATION est autorisée (frais à la charge de la faculté).
        if (request.getDecision() == DecisionResponsable.RENVOYER_CHANGER) {
            LocalDate dateFinGarantie = ressource.getDateLivraison().plusMonths(ressource.getDureeGarantie());
            if (LocalDate.now().isAfter(dateFinGarantie)) {
                throw new RuntimeException("Impossible de demander un CHANGEMENT : la garantie est expirée. Seule la réparation est possible.");
            }
        }

        constat.setDecisionResponsable(request.getDecision());
        constatRepository.save(constat);

        // Notification au fournisseur pour les deux décisions
        Map<String, Object> payload = new HashMap<>();
        payload.put("codeInventaire", ressource.getCodeInventaire());
        payload.put("explication", constat.getExplication());
        payload.put("frequence", constat.getFrequence().name());
        payload.put("typePanne", constat.getTypePanne().name());
        payload.put("dateApparition", panne.getDateApparition().toString());
        payload.put("decision", request.getDecision().name());
        payload.put("garantieActive", true);

        notificationService.send(
                ressource.getFournisseur().getId(),
                NotificationType.RENVOI_RESSOURCE,
                payload
        );

        // Mettre à jour le statut de la panne
        panne.setStatut(StatutPanne.ENVOYEE_FOURNISSEUR);
        panneRepository.save(panne);

        PanneResponse response = panneMapper.toResponse(panne);
        response.setConstat(constatMapper.toResponse(constat));
        return response;
    }

    // ──────────────────────────────────────────────────────────────────────
    // Lecture
    // ──────────────────────────────────────────────────────────────────────

    @Override
    public List<PanneResponse> findAll(StatutPanne statut, UUID ressourceTypeId) {
        List<Panne> pannes = panneRepository.findAll();
        if (statut != null) {
            pannes = pannes.stream().filter(p -> p.getStatut() == statut).collect(Collectors.toList());
        }
        return pannes.stream().map(panne -> enrichResponse(panneMapper.toResponse(panne), panne))
                .collect(Collectors.toList());
    }

    @Override
    public List<PanneResponse> findMine(StatutPanne statut, String currentUserEmail) {
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé"));

        List<Panne> pannes;
        if (currentUser.getRole() == Role.FOURNISSEUR) {
            // Utilisation de la méthode de recherche par fournisseur de la ressource
            pannes = panneRepository.findByRessourceFournisseurId(currentUser.getId());
        } else {
            // L'enseignant voit seulement ce qu'il a signalé
            pannes = panneRepository.findAll().stream()
                    .filter(p -> p.getSignaledBy() != null && Objects.equals(p.getSignaledBy().getId(), currentUser.getId()))
                    .collect(Collectors.toList());
        }

        if (statut != null) {
            pannes = pannes.stream().filter(p -> p.getStatut() == statut).collect(Collectors.toList());
        }

        return pannes.stream()
                .map(panne -> enrichResponse(panneMapper.toResponse(panne), panne))
                .collect(Collectors.toList());
    }

    @Override
    public PanneResponse findById(UUID id) {
        Panne panne = panneRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Panne non trouvée"));
        return enrichResponse(panneMapper.toResponse(panne), panne);
    }

    // ──────────────────────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────────────────────

    private PanneResponse enrichResponse(PanneResponse response, Panne panne) {
        constatRepository.findByPanneId(panne.getId())
                .ifPresent(constat -> response.setConstat(constatMapper.toResponse(constat)));
        return response;
    }

    private UUID getUserDepartementId(User user) {
        if (user instanceof Enseignant e && e.getDepartement() != null) return e.getDepartement().getId();
        if (user instanceof ChefDepartement c && c.getDepartement() != null) return c.getDepartement().getId();
        return null;
    }
}

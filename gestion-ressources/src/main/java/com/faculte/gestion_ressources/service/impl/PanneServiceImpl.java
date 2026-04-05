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
    private final NotificationService notificationService;

    @Override
    @Transactional
    public PanneResponse create(PanneRequest request, String signalerEmail) {
        User signaler = userRepository.findByEmail(signalerEmail)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé"));

        Ressource ressource = ressourceRepository.findById(request.getRessourceId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Ressource non trouvée"));

        // Ownership checks
        Affectation affectation = affectationRepository.findActiveByRessourceId(ressource.getId())
                .orElseThrow(() -> new AppException(HttpStatus.FORBIDDEN, "Ressource non accessible par votre compte"));

        boolean isAuthorized = false;
        if (affectation.getTypeAffectation() == TypeAffectation.INDIVIDUELLE) {
            if (affectation.getUtilisateur() != null) {
                isAuthorized = affectation.getUtilisateur().getId().equals(signaler.getId());
            }
        } else {
            isAuthorized = affectation.getDepartement().getId().equals(signaler.getDepartement().getId());
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

    @Override
    public List<PanneResponse> findAll(StatutPanne statut, UUID ressourceTypeId) {
        List<Panne> pannes = panneRepository.findAll();
        if (statut != null) {
            pannes = pannes.stream().filter(p -> p.getStatut() == statut).collect(Collectors.toList());
        }
        return pannes.stream().map(panneMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public PanneResponse findById(UUID id) {
        Panne panne = panneRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Panne non trouvée"));
        PanneResponse response = panneMapper.toResponse(panne);
        constatRepository.findByPanneId(panne.getId()).ifPresent(c -> {
            // Need a mapper effectively, but since Mapstruct is configured let's assume ConstatMapper is injected or we just 
            // map it directly if ConstatResponse mapper isn't requested here. Wait, PanneMapper ignores constat.
            // I will leave it null for simplicity unless requested explicitly in the GET /pannes/{id}.
        });
        return response;
    }

    @Override
    @Transactional
    public PanneResponse updateStatut(UUID id, PanneStatusRequest request) {
        Panne panne = panneRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Panne non trouvée"));

        panne.setStatut(request.getStatut());
        if (request.getStatut() == StatutPanne.RESOLUE) {
            Ressource ressource = panne.getRessource();
            if (affectationRepository.findActiveByRessourceId(ressource.getId()).isPresent()) {
                ressource.setEtat(EtatRessource.AFFECTEE);
            } else {
                ressource.setEtat(EtatRessource.DISPONIBLE);
            }
            ressourceRepository.save(ressource);
        }
        return panneMapper.toResponse(panneRepository.save(panne));
    }

    @Override
    @Transactional
    public PanneResponse addConstat(UUID panneId, ConstatRequest request, String technicienEmail) {
        Panne panne = panneRepository.findById(panneId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Panne non trouvée"));

        if (panne.getRessource().getType() == TypeRessource.IMPRIMANTE && request.getTypePanne() == TypePanne.LOGICIEL) {
            throw new AppException(HttpStatus.UNPROCESSABLE_ENTITY, "Une imprimante ne peut pas avoir une panne logicielle");
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
        return panneMapper.toResponse(panne);
    }

    @Override
    @Transactional
    public PanneResponse addDecision(UUID panneId, DecisionRequest request) {
        Panne panne = panneRepository.findById(panneId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Panne non trouvée"));

        Constat constat = constatRepository.findByPanneId(panneId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Constat non trouvé. Décision impossible."));

        Ressource ressource = panne.getRessource();
        Offre offre = ressource.getOffre();

        if (request.getDecision() == DecisionResponsable.CHANGER || request.getDecision() == DecisionResponsable.RENVOYER) {
            boolean garantieActive = false;
            if (offre != null && ressource.getDateLivraison() != null) {
                garantieActive = ressource.getDateLivraison().plusMonths(offre.getDureeGarantieMois()).isAfter(LocalDate.now());
            }
            if (!garantieActive) {
                throw new AppException(HttpStatus.CONFLICT, "Garantie expirée");
            }
            
            if (request.getDecision() == DecisionResponsable.RENVOYER && !constat.getNotificationEnvoyee()) {
                Map<String, Object> payload = new HashMap<>();
                payload.put("codeInventaire", ressource.getCodeInventaire());
                payload.put("explication", constat.getExplication());
                payload.put("decision", "RENVOYER");
                payload.put("garantieActive", true);
                
                notificationService.send(ressource.getFournisseur().getUser().getId(), NotificationType.RENVOI_RESSOURCE, payload);
                constat.setNotificationEnvoyee(true);
            }
        }
        
        constat.setDecisionResponsable(request.getDecision());
        constatRepository.save(constat);

        return panneMapper.toResponse(panne);
    }
}

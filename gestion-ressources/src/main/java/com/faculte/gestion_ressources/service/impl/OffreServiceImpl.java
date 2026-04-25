package com.faculte.gestion_ressources.service.impl;

import com.faculte.gestion_ressources.dto.request.OffreRequest;
import com.faculte.gestion_ressources.dto.response.OffreResponse;
import com.faculte.gestion_ressources.entity.AppelOffre;
import com.faculte.gestion_ressources.entity.Fournisseur;
import com.faculte.gestion_ressources.entity.Offre;
import com.faculte.gestion_ressources.entity.User;
import com.faculte.gestion_ressources.enums.Role;
import com.faculte.gestion_ressources.enums.NotificationType;
import com.faculte.gestion_ressources.enums.StatutAppelOffre;
import com.faculte.gestion_ressources.enums.StatutOffre;
import com.faculte.gestion_ressources.exception.AppException;
import com.faculte.gestion_ressources.mapper.OffreMapper;
import com.faculte.gestion_ressources.repository.AppelOffreRepository;
import com.faculte.gestion_ressources.repository.FournisseurRepository;
import com.faculte.gestion_ressources.repository.OffreRepository;
import com.faculte.gestion_ressources.repository.UserRepository;
import com.faculte.gestion_ressources.service.FournisseurService;
import com.faculte.gestion_ressources.service.NotificationService;
import com.faculte.gestion_ressources.service.OffreService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
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
public class OffreServiceImpl implements OffreService {

    private final OffreRepository offreRepository;
    private final AppelOffreRepository appelOffreRepository;
    private final UserRepository userRepository;
    private final FournisseurRepository fournisseurRepository;
    private final FournisseurService fournisseurService;
    private final NotificationService notificationService;
    private final OffreMapper offreMapper;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public OffreResponse create(OffreRequest request, String fournisseurEmail) {
        Fournisseur fournisseur = resolveFournisseur(fournisseurEmail);

        fournisseurService.checkBlacklist(fournisseur.getId());

        AppelOffre appelOffre = appelOffreRepository.findById(request.getAppelOffreId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Appel d'offre non trouvé"));

        if (appelOffre.getStatut() != StatutAppelOffre.OUVERT) {
            throw new AppException(HttpStatus.CONFLICT, "L'appel d'offre est clos");
        }

        if (request.getDateLivraison().isBefore(LocalDate.now())) {
            throw new AppException(HttpStatus.UNPROCESSABLE_ENTITY, "La date de livraison doit être dans le futur");
        }

        if (offreRepository.existsByAppelOffreIdAndFournisseurId(appelOffre.getId(), fournisseur.getId())) {
            throw new AppException(HttpStatus.CONFLICT, "Vous avez déjà soumis une offre pour cet appel d'offre");
        }

        String detailJson;
        try {
            detailJson = objectMapper.writeValueAsString(request.getDetail());
        } catch (JsonProcessingException e) {
            throw new AppException(HttpStatus.UNPROCESSABLE_ENTITY, "Format des détails invalide");
        }

        Offre offre = Offre.builder()
                .appelOffre(appelOffre)
                .fournisseur(fournisseur)
                .dateLivraison(request.getDateLivraison())
                .dureeGarantieMois(request.getDureeGarantieMois())
                .prixTotal(request.getPrixTotal())
                .detailJson(detailJson)
                .statut(StatutOffre.EN_ATTENTE)
                .build();

        return offreMapper.toResponse(offreRepository.save(offre));
    }

    @Override
    public List<OffreResponse> findAll(StatutOffre statut) {
        List<Offre> offres = statut == null
                ? offreRepository.findAll()
                : offreRepository.findByStatutOrderByIdDesc(statut);

        return offres.stream()
                .map(offreMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<OffreResponse> findAllByAppelOffre(UUID appelOffreId, String currentUserEmail) {
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé"));

        List<Offre> offres = currentUser.getRole() == Role.FOURNISSEUR
                ? offreRepository.findByAppelOffreIdAndFournisseurIdOrderByPrixTotalAsc(appelOffreId, resolveFournisseur(currentUserEmail).getId())
                : offreRepository.findByAppelOffreIdOrderByPrixTotalAsc(appelOffreId);

        return offres.stream()
                .map(offreMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public OffreResponse findById(UUID id, String currentUserEmail) {
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé"));

        Offre offre = currentUser.getRole() == Role.FOURNISSEUR
                ? offreRepository.findByIdAndFournisseurId(id, resolveFournisseur(currentUserEmail).getId())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Offre non trouvée"))
                : offreRepository.findById(id)
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Offre non trouvée"));

        return offreMapper.toResponse(offre);
    }

    @Override
    public List<OffreResponse> findMine(String currentUserEmail) {
        Fournisseur fournisseur = resolveFournisseur(currentUserEmail);
        return offreRepository.findByFournisseurIdOrderByIdDesc(fournisseur.getId()).stream()
                .map(offreMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void selectionner(UUID id) {
        Offre offreAcceptee = offreRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Offre non trouvée"));

        AppelOffre appelOffre = offreAcceptee.getAppelOffre();
        if (appelOffre.getStatut() == StatutAppelOffre.CLOS) {
            throw new AppException(HttpStatus.CONFLICT, "L'appel d'offre est déjà clos");
        }

        List<Offre> toutesOffres = offreRepository.findByAppelOffreId(appelOffre.getId());

        for (Offre o : toutesOffres) {
            if (o.getId().equals(offreAcceptee.getId())) {
                o.setStatut(StatutOffre.ACCEPTEE);
                Map<String, Object> payload = new HashMap<>();
                payload.put("message", "Votre offre a été retenue");
                payload.put("offreId", o.getId());
                payload.put("appelOffreId", appelOffre.getId());
                notificationService.send(o.getFournisseur().getId(), NotificationType.OFFRE_ACCEPTEE, payload);
            } else {
                o.setStatut(StatutOffre.REJETEE);
                Map<String, Object> payload = new HashMap<>();
                payload.put("message", "Votre offre n'a pas été retenue");
                payload.put("offreId", o.getId());
                payload.put("appelOffreId", appelOffre.getId());
                notificationService.send(o.getFournisseur().getId(), NotificationType.OFFRE_REJETEE, payload);
            }
        }
        
        appelOffre.setStatut(StatutAppelOffre.CLOS);
        appelOffreRepository.save(appelOffre);
        offreRepository.saveAll(toutesOffres);
    }

    @Override
    @Transactional
    public void selectionnerMoinsDisant(UUID appelOffreId) {
        List<Offre> offres = offreRepository.findByAppelOffreIdOrderByPrixTotalAsc(appelOffreId);
        if (offres.isEmpty()) {
            throw new AppException(HttpStatus.NOT_FOUND, "Aucune offre disponible pour cet appel d'offre");
        }

        Offre candidate = offres.stream()
                .filter(item -> item.getStatut() == StatutOffre.EN_ATTENTE)
                .findFirst()
                .orElse(offres.get(0));

        selectionner(candidate.getId());
    }

    private Fournisseur resolveFournisseur(String fournisseurEmail) {
        User user = userRepository.findByEmail(fournisseurEmail)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé"));

        return fournisseurRepository.findById(user.getId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Fournisseur non trouvé"));
    }
}

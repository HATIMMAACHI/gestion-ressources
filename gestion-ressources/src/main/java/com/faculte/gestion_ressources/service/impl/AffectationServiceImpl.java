package com.faculte.gestion_ressources.service.impl;

import com.faculte.gestion_ressources.dto.request.AffectationRequest;
import com.faculte.gestion_ressources.dto.response.AffectationResponse;
import com.faculte.gestion_ressources.entity.Affectation;
import com.faculte.gestion_ressources.entity.Departement;
import com.faculte.gestion_ressources.entity.Ressource;
import com.faculte.gestion_ressources.entity.User;
import com.faculte.gestion_ressources.enums.EtatRessource;
import com.faculte.gestion_ressources.enums.StatutPanne;
import com.faculte.gestion_ressources.enums.TypeAffectation;
import com.faculte.gestion_ressources.exception.AppException;
import com.faculte.gestion_ressources.mapper.AffectationMapper;
import com.faculte.gestion_ressources.repository.AffectationRepository;
import com.faculte.gestion_ressources.repository.DepartementRepository;
import com.faculte.gestion_ressources.repository.PanneRepository;
import com.faculte.gestion_ressources.repository.RessourceRepository;
import com.faculte.gestion_ressources.repository.UserRepository;
import com.faculte.gestion_ressources.service.AffectationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AffectationServiceImpl implements AffectationService {

    private final AffectationRepository affectationRepository;
    private final RessourceRepository ressourceRepository;
    private final DepartementRepository departementRepository;
    private final UserRepository userRepository;
    private final PanneRepository panneRepository;
    private final AffectationMapper affectationMapper;

    @Override
    @Transactional
    public AffectationResponse create(AffectationRequest request) {
        Ressource ressource = ressourceRepository.findById(request.getRessourceId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Ressource non trouvée"));

        if (ressource.getEtat() != EtatRessource.DISPONIBLE) {
            throw new AppException(HttpStatus.CONFLICT, "La ressource n'est pas disponible");
        }

        Departement departement = departementRepository.findById(request.getDepartementId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Département non trouvé"));

        User utilisateur = null;
        TypeAffectation typeAffectation = TypeAffectation.DEPARTEMENTALE;

        if (request.getUtilisateurId() != null) {
            utilisateur = userRepository.findById(request.getUtilisateurId())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé"));
            
            if (!utilisateur.getDepartement().getId().equals(departement.getId())) {
                throw new AppException(HttpStatus.UNPROCESSABLE_ENTITY, "L'utilisateur n'appartient pas au département donné");
            }
            typeAffectation = TypeAffectation.INDIVIDUELLE;
        }

        Affectation affectation = Affectation.builder()
                .ressource(ressource)
                .departement(departement)
                .utilisateur(utilisateur)
                .dateAffectation(LocalDate.now())
                .actif(true)
                .typeAffectation(typeAffectation)
                .build();

        ressource.setEtat(EtatRessource.AFFECTEE);
        ressourceRepository.save(ressource);
        
        return toResponseWithFormatting(affectationRepository.save(affectation));
    }

    @Override
    public List<AffectationResponse> findAll(UUID departementId, TypeAffectation typeAffectation, Boolean actif) {
        List<Affectation> list = affectationRepository.findAll();
        if (departementId != null) list = list.stream().filter(a -> a.getDepartement().getId().equals(departementId)).collect(Collectors.toList());
        if (typeAffectation != null) list = list.stream().filter(a -> a.getTypeAffectation() == typeAffectation).collect(Collectors.toList());
        if (actif != null) list = list.stream().filter(a -> a.getActif().equals(actif)).collect(Collectors.toList());
        
        return list.stream().map(this::toResponseWithFormatting).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AffectationResponse update(UUID id, AffectationRequest request) {
        Affectation affectation = affectationRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Affectation non trouvée"));

        if (request.getUtilisateurId() != null) {
            User utilisateur = userRepository.findById(request.getUtilisateurId())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé"));
            if (!utilisateur.getDepartement().getId().equals(affectation.getDepartement().getId())) {
                throw new AppException(HttpStatus.UNPROCESSABLE_ENTITY, "L'utilisateur n'appartient pas au département");
            }
            affectation.setUtilisateur(utilisateur);
            affectation.setTypeAffectation(TypeAffectation.INDIVIDUELLE);
        } else {
            affectation.setUtilisateur(null);
            affectation.setTypeAffectation(TypeAffectation.DEPARTEMENTALE);
        }

        return toResponseWithFormatting(affectationRepository.save(affectation));
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        Affectation affectation = affectationRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Affectation non trouvée"));

        boolean hasActivePanne = panneRepository.existsByRessourceIdAndStatutNot(affectation.getRessource().getId(), StatutPanne.RESOLUE);
        if (hasActivePanne) {
            throw new AppException(HttpStatus.CONFLICT, "Impossible de supprimer l'affectation, la ressource a une panne en cours");
        }

        affectation.setActif(false);
        affectationRepository.save(affectation);
        
        Ressource ressource = affectation.getRessource();
        ressource.setEtat(EtatRessource.DISPONIBLE);
        ressourceRepository.save(ressource);
    }
    
    private AffectationResponse toResponseWithFormatting(Affectation affectation) {
        AffectationResponse response = affectationMapper.toResponse(affectation);
        if (affectation.getTypeAffectation() == TypeAffectation.INDIVIDUELLE && affectation.getUtilisateur() != null) {
            response.setAffecteA(affectation.getUtilisateur().getNom());
        } else {
            response.setAffecteA("Département: " + affectation.getDepartement().getNom());
        }
        return response;
    }
}

package com.faculte.gestion_ressources.service.impl;

import com.faculte.gestion_ressources.dto.request.BesoinRequest;
import com.faculte.gestion_ressources.dto.response.BesoinResponse;
import com.faculte.gestion_ressources.entity.Besoin;
import com.faculte.gestion_ressources.entity.Departement;
import com.faculte.gestion_ressources.entity.User;
import com.faculte.gestion_ressources.enums.StatutBesoin;
import com.faculte.gestion_ressources.exception.AppException;
import com.faculte.gestion_ressources.mapper.BesoinMapper;
import com.faculte.gestion_ressources.repository.BesoinRepository;
import com.faculte.gestion_ressources.repository.DepartementRepository;
import com.faculte.gestion_ressources.repository.UserRepository;
import com.faculte.gestion_ressources.service.BesoinService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BesoinServiceImpl implements BesoinService {

    private final BesoinRepository besoinRepository;
    private final UserRepository userRepository;
    private final DepartementRepository departementRepository;
    private final BesoinMapper besoinMapper;

    @Override
    @Transactional
    public BesoinResponse create(BesoinRequest request) {
        User demandeur = null;
        Departement departement;

        if (request.getDemandeurId() != null) {
            demandeur = userRepository.findById(request.getDemandeurId())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Demandeur non trouvé"));
            departement = demandeur.getDepartement();
        } else {
            // Dans ce contexte, on devrait avoir le département de l'initiateur (chef/enseignant courant)
            // Pour simplifier selon le cahier des charges générique, si pas de demandeur = besoin département de l'user courant
            // En pratique, un demandeurId null signifie besoin département, il faut chercher le dept dans la sécu.
            // On peut lever une erreur s'il manque.
            throw new AppException(HttpStatus.BAD_REQUEST, "demandeurId requis ou impossible de déduire le département");
        }

        // Validate specs
        if (request.getSpecs() == null || request.getSpecs().isBlank()) {
            throw new AppException(HttpStatus.UNPROCESSABLE_ENTITY, "Les specsJson sont invalides");
        }

        Besoin besoin = Besoin.builder()
                .typeRessource(request.getTypeRessource())
                .quantite(request.getQuantite())
                .specsJson(request.getSpecs())
                .motif(request.getMotif())
                .demandeur(demandeur)
                .departement(departement)
                .statut(StatutBesoin.BROUILLON)
                .build();

        return besoinMapper.toResponse(besoinRepository.save(besoin));
    }

    @Override
    public List<BesoinResponse> findAll(UUID departementId, StatutBesoin statut) {
        List<Besoin> besoins;
        if (departementId != null && statut != null) {
            besoins = besoinRepository.findByDepartementIdAndStatut(departementId, statut);
        } else if (departementId != null) {
            besoins = besoinRepository.findByDepartementId(departementId);
        } else {
            besoins = besoinRepository.findAll();
        }
        return besoins.stream().map(besoinMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BesoinResponse update(UUID id, BesoinRequest request) {
        Besoin besoin = besoinRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Besoin non trouvé"));

        if (besoin.getStatut() != StatutBesoin.BROUILLON && besoin.getStatut() != StatutBesoin.EN_REUNION) {
            throw new AppException(HttpStatus.CONFLICT, "Le besoin ne peut être modifié qu'en statut BROUILLON ou EN_REUNION");
        }

        besoin.setTypeRessource(request.getTypeRessource());
        besoin.setQuantite(request.getQuantite());
        besoin.setSpecsJson(request.getSpecs());
        besoin.setMotif(request.getMotif());

        return besoinMapper.toResponse(besoinRepository.save(besoin));
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        Besoin besoin = besoinRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Besoin non trouvé"));

        if (besoin.getStatut() != StatutBesoin.BROUILLON) {
            throw new AppException(HttpStatus.CONFLICT, "Seul un besoin en statut BROUILLON peut être supprimé");
        }
        besoinRepository.delete(besoin);
    }
}

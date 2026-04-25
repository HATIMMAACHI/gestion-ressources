package com.faculte.gestion_ressources.service.impl;

import com.faculte.gestion_ressources.dto.request.BesoinRequest;
import com.faculte.gestion_ressources.dto.request.BesoinStatusRequest;
import com.faculte.gestion_ressources.dto.response.BesoinResponse;
import com.faculte.gestion_ressources.entity.Besoin;
import com.faculte.gestion_ressources.entity.Departement;
import com.faculte.gestion_ressources.entity.User;
import com.faculte.gestion_ressources.entity.ChefDepartement;
import com.faculte.gestion_ressources.entity.Enseignant;
import com.faculte.gestion_ressources.enums.Role;
import com.faculte.gestion_ressources.enums.StatutBesoin;
import com.faculte.gestion_ressources.exception.AppException;
import com.faculte.gestion_ressources.mapper.BesoinMapper;
import com.faculte.gestion_ressources.repository.BesoinRepository;
import com.faculte.gestion_ressources.repository.DepartementRepository;
import com.faculte.gestion_ressources.repository.UserRepository;
import com.faculte.gestion_ressources.service.BesoinService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
            departement = getUserDepartement(demandeur);
        } else {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
                throw new AppException(HttpStatus.UNAUTHORIZED, "Utilisateur non authentifié");
            }

            String email = authentication.getName();
            demandeur = userRepository.findByEmail(email)
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Utilisateur connecté introuvable"));
            departement = getUserDepartement(demandeur);
        }

        if (departement == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Impossible de déduire le département pour ce besoin");
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
        } else if (statut != null) {
            besoins = besoinRepository.findByStatut(statut);
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
    public BesoinResponse updateStatus(UUID id, BesoinStatusRequest request) {
        Besoin besoin = besoinRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Besoin non trouvé"));

        StatutBesoin current = besoin.getStatut();
        StatutBesoin target = request.getStatut();

        if (target == null) {
            throw new AppException(HttpStatus.UNPROCESSABLE_ENTITY, "Le statut cible est requis");
        }

        if (current == target) {
            return besoinMapper.toResponse(besoin);
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Utilisateur non authentifié");
        }

        User acteur = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Utilisateur connecté introuvable"));

        boolean isChefDept = acteur.getRole() == Role.CHEF_DEPT;
        boolean isResponsable = acteur.getRole() == Role.RESPONSABLE;

        boolean allowed =
                (target == StatutBesoin.VALIDE
                        && isChefDept
                        && (current == StatutBesoin.BROUILLON || current == StatutBesoin.EN_REUNION))
                        || (target == StatutBesoin.EN_APPEL
                        && isResponsable
                        && current == StatutBesoin.VALIDE);

        if (!allowed) {
            throw new AppException(HttpStatus.CONFLICT, "Transition de statut non autorisée");
        }

        besoin.setStatut(target);
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

    private Departement getUserDepartement(User user) {
        // If it's a proxy, instanceof might fail. We check the role and use the ID to get the specific entity if needed.
        if (user.getRole() == Role.ENSEIGNANT) {
            return userRepository.findEnseignantById(user.getId())
                    .map(Enseignant::getDepartement)
                    .orElse(null);
        }
        if (user.getRole() == Role.CHEF_DEPT) {
            return userRepository.findChefById(user.getId())
                    .map(ChefDepartement::getDepartement)
                    .orElse(null);
        }
        return null;
    }
}

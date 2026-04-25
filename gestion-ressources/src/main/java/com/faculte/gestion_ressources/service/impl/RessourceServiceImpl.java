package com.faculte.gestion_ressources.service.impl;

import com.faculte.gestion_ressources.dto.request.RessourceRequest;
import com.faculte.gestion_ressources.dto.response.RessourceResponse;
import com.faculte.gestion_ressources.entity.Fournisseur;
import com.faculte.gestion_ressources.entity.Imprimante;
import com.faculte.gestion_ressources.entity.Offre;
import com.faculte.gestion_ressources.entity.Ordinateur;
import com.faculte.gestion_ressources.entity.Affectation;
import com.faculte.gestion_ressources.entity.AffectationPrevue;
import com.faculte.gestion_ressources.entity.Ressource;
import com.faculte.gestion_ressources.enums.EtatRessource;
import com.faculte.gestion_ressources.enums.StatutPanne;
import com.faculte.gestion_ressources.enums.TypeRessource;
import com.faculte.gestion_ressources.enums.TypeAffectation;
import com.faculte.gestion_ressources.exception.AppException;
import com.faculte.gestion_ressources.mapper.RessourceMapper;
import com.faculte.gestion_ressources.repository.AffectationPrevueRepository;
import com.faculte.gestion_ressources.repository.AffectationRepository;
import com.faculte.gestion_ressources.repository.FournisseurRepository;
import com.faculte.gestion_ressources.repository.OffreRepository;
import com.faculte.gestion_ressources.repository.PanneRepository;
import com.faculte.gestion_ressources.repository.RessourceRepository;
import com.faculte.gestion_ressources.service.RessourceService;
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
public class RessourceServiceImpl implements RessourceService {

    private final RessourceRepository ressourceRepository;
    private final OffreRepository offreRepository;
    private final FournisseurRepository fournisseurRepository;
    private final AffectationPrevueRepository affectationPrevueRepository;
    private final AffectationRepository affectationRepository;
    private final PanneRepository panneRepository;
    private final RessourceMapper ressourceMapper;

    @Override
    @Transactional
    public RessourceResponse create(RessourceRequest request, String responsableEmail) {
        Offre offre = null;
        Fournisseur fournisseur = null;

        if (request.getOffreId() != null) {
            offre = offreRepository.findById(request.getOffreId())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Offre non trouvée"));
            fournisseur = offre.getFournisseur();
        }

        if (fournisseur == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Impossible de déterminer le fournisseur");
        }

        // Si des informations fournisseur sont fournies à la réception, on met à jour le profil
        // (ne bloque pas la création si elles manquent).
        boolean shouldUpdateFournisseur = false;
        if (request.getFournisseurAdresse() != null && !request.getFournisseurAdresse().trim().isEmpty()) {
            fournisseur.setAdresse(request.getFournisseurAdresse().trim());
            shouldUpdateFournisseur = true;
        }
        if (request.getFournisseurGerant() != null && !request.getFournisseurGerant().trim().isEmpty()) {
            fournisseur.setGerant(request.getFournisseurGerant().trim());
            shouldUpdateFournisseur = true;
        }
        if (request.getFournisseurSiteWeb() != null && !request.getFournisseurSiteWeb().trim().isEmpty()) {
            fournisseur.setSiteWeb(request.getFournisseurSiteWeb().trim());
            shouldUpdateFournisseur = true;
        }
        if (shouldUpdateFournisseur) {
            fournisseurRepository.save(fournisseur);
        }

        Ressource ressource;
        if (request.getType() == TypeRessource.ORDINATEUR) {
            ressource = Ordinateur.builder()
                    .codeInventaire(request.getCodeInventaire())
                    .marque(request.getMarque())
                    .specsJson(request.getSpecsJson())
                    .etat(EtatRessource.DISPONIBLE)
                    .dateLivraison(request.getDateLivraison())
                    .fournisseur(fournisseur)
                    .offre(offre)
                    .cpu(request.getCpu())
                    .ram(request.getRam())
                    .disqueDur(request.getDisqueDur())
                    .ecran(request.getEcran())
                    .build();
        } else if (request.getType() == TypeRessource.IMPRIMANTE) {
            ressource = Imprimante.builder()
                    .codeInventaire(request.getCodeInventaire())
                    .marque(request.getMarque())
                    .specsJson(request.getSpecsJson())
                    .etat(EtatRessource.DISPONIBLE)
                    .dateLivraison(request.getDateLivraison())
                    .fournisseur(fournisseur)
                    .offre(offre)
                    .vitesseImpression(request.getVitesseImpression())
                    .resolution(request.getResolution())
                    .build();
        } else {
            throw new AppException(HttpStatus.BAD_REQUEST, "Type de ressource non supporté");
        }

        Ressource saved = ressourceRepository.save(ressource);

        // Affectation automatique si l'on dispose d'une offre (donc d'un appel d'offre).
        if (offre != null && offre.getAppelOffre() != null) {
            List<AffectationPrevue> prevues = affectationPrevueRepository.findByAppelOffreId(offre.getAppelOffre().getId());

            AffectationPrevue candidate = prevues.stream()
                    .filter(item -> item.getBesoin() != null
                            && item.getBesoin().getTypeRessource() == request.getType())
                    .findFirst()
                    .orElse(null);

            if (candidate != null) {
                Affectation affectation = Affectation.builder()
                        .ressource(saved)
                        .departement(candidate.getDepartement())
                        .utilisateur(candidate.getUtilisateur())
                        .dateAffectation(LocalDate.now())
                        .actif(true)
                        .typeAffectation(candidate.getUtilisateur() != null ? TypeAffectation.INDIVIDUELLE : TypeAffectation.DEPARTEMENTALE)
                        .build();

                affectationRepository.save(affectation);

                saved.setEtat(EtatRessource.AFFECTEE);
                saved = ressourceRepository.save(saved);
            }
        }

        return ressourceMapper.toResponse(saved);
    }

    @Override
    public List<RessourceResponse> findAll(TypeRessource type, EtatRessource etat, UUID fournisseurId) {
        // Pour être concis, on retourne tout. Si la perf est un soucis, un Speficication JPA serait approprié.
        List<Ressource> ressources = ressourceRepository.findAll();
        
        if (type != null) ressources = ressources.stream().filter(r -> r.getType() == type).collect(Collectors.toList());
        if (etat != null) ressources = ressources.stream().filter(r -> r.getEtat() == etat).collect(Collectors.toList());
        if (fournisseurId != null) ressources = ressources.stream().filter(r -> r.getFournisseur().getId().equals(fournisseurId)).collect(Collectors.toList());

        return ressources.stream().map(ressourceMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public RessourceResponse findById(UUID id) {
        Ressource ressource = ressourceRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Ressource non trouvée"));
        // TODO populate infos complementaires: historique pannes, garantie
        return ressourceMapper.toResponse(ressource);
    }

    @Override
    @Transactional
    public RessourceResponse update(UUID id, RessourceRequest request) {
        Ressource ressource = ressourceRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Ressource non trouvée"));

        ressource.setMarque(request.getMarque());
        ressource.setSpecsJson(request.getSpecsJson());
        ressource.setType(request.getType());
        
        return ressourceMapper.toResponse(ressourceRepository.save(ressource));
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        Ressource ressource = ressourceRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Ressource non trouvée"));

        if (ressource.getEtat() == EtatRessource.AFFECTEE) {
            throw new AppException(HttpStatus.CONFLICT, "Impossible de supprimer une ressource affectée");
        }
        
        boolean hasActivePanne = panneRepository.existsByRessourceIdAndStatutNot(id, StatutPanne.RESOLUE);
        if (hasActivePanne) {
            throw new AppException(HttpStatus.CONFLICT, "Impossible de supprimer une ressource avec une panne ouverte");
        }

        ressourceRepository.delete(ressource);
    }
}

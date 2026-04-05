package com.faculte.gestion_ressources.service.impl;

import com.faculte.gestion_ressources.dto.request.AppelOffreRequest;
import com.faculte.gestion_ressources.dto.response.AffectationPrevueResponse;
import com.faculte.gestion_ressources.dto.response.AppelOffreResponse;
import com.faculte.gestion_ressources.entity.AffectationPrevue;
import com.faculte.gestion_ressources.entity.AppelOffre;
import com.faculte.gestion_ressources.entity.Besoin;
import com.faculte.gestion_ressources.entity.User;
import com.faculte.gestion_ressources.enums.StatutAppelOffre;
import com.faculte.gestion_ressources.enums.StatutBesoin;
import com.faculte.gestion_ressources.exception.AppException;
import com.faculte.gestion_ressources.mapper.AppelOffreMapper;
import com.faculte.gestion_ressources.repository.AffectationPrevueRepository;
import com.faculte.gestion_ressources.repository.AppelOffreRepository;
import com.faculte.gestion_ressources.repository.BesoinRepository;
import com.faculte.gestion_ressources.repository.UserRepository;
import com.faculte.gestion_ressources.service.AppelOffreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppelOffreServiceImpl implements AppelOffreService {

    private final AppelOffreRepository appelOffreRepository;
    private final BesoinRepository besoinRepository;
    private final UserRepository userRepository;
    private final AffectationPrevueRepository affectationPrevueRepository;
    private final AppelOffreMapper appelOffreMapper;

    @Override
    @Transactional
    public AppelOffreResponse create(AppelOffreRequest request, String responsableEmail) {
        if (request.getBesoinIds() == null || request.getBesoinIds().isEmpty()) {
            throw new AppException(HttpStatus.UNPROCESSABLE_ENTITY, "Il faut au moins 1 besoin");
        }

        User responsable = userRepository.findByEmail(responsableEmail)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Responsable non trouvé"));

        List<Besoin> besoins = besoinRepository.findAllById(request.getBesoinIds());
        if (besoins.size() != request.getBesoinIds().size() || besoins.isEmpty()) {
            throw new AppException(HttpStatus.NOT_FOUND, "Certains besoins sont introuvables");
        }

        boolean allValides = besoins.stream().allMatch(b -> b.getStatut() == StatutBesoin.VALIDE);
        if (!allValides) {
            throw new AppException(HttpStatus.UNPROCESSABLE_ENTITY, "Tous les besoins doivent être au statut VALIDE");
        }

        AppelOffre appelOffre = AppelOffre.builder()
                .dateDebut(LocalDate.now())
                .dateFin(request.getDateFin())
                .statut(StatutAppelOffre.OUVERT)
                .responsable(responsable)
                .build();
        
        appelOffre = appelOffreRepository.save(appelOffre);

        List<AffectationPrevue> affectationsPrevues = new ArrayList<>();

        for (Besoin besoin : besoins) {
            besoin.setStatut(StatutBesoin.EN_APPEL);
            besoin.setAppelOffre(appelOffre);
            
            AffectationPrevue affectationPrevue = AffectationPrevue.builder()
                    .appelOffre(appelOffre)
                    .besoin(besoin)
                    .utilisateur(besoin.getDemandeur()) // Null if dept
                    .departement(besoin.getDepartement())
                    .build();
            affectationsPrevues.add(affectationPrevue);
        }

        besoinRepository.saveAll(besoins);
        affectationPrevueRepository.saveAll(affectationsPrevues);

        AppelOffreResponse response = appelOffreMapper.toResponse(appelOffre);
        response.setAffectationsPrevues(affectationsPrevues.stream()
                .map(appelOffreMapper::toAffectationPrevueResponse).collect(Collectors.toList()));

        return response;
    }

    @Override
    public List<AppelOffreResponse> findAll() {
        return appelOffreRepository.findAll().stream()
                .map(appelOffreMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AppelOffreResponse findById(UUID id) {
        AppelOffre appelOffre = appelOffreRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Appel d'offre non trouvé"));
        // Mettre à jour avec besoins et offres en détail si besoin, non explicitement demandé dans les specs GET base, 
        // Mais "Inclure : besoins associés + nombre d'offres reçues" -> TODO populate
        return appelOffreMapper.toResponse(appelOffre);
    }

    @Override
    public List<AffectationPrevueResponse> getAffectationsPrevues(UUID id) {
        return affectationPrevueRepository.findByAppelOffreId(id).stream()
                .map(appelOffreMapper::toAffectationPrevueResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void clore(UUID id) {
        AppelOffre appelOffre = appelOffreRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Appel d'offre non trouvé"));
        if (appelOffre.getStatut() == StatutAppelOffre.CLOS) {
            throw new AppException(HttpStatus.CONFLICT, "L'appel d'offre est déjà clos");
        }
        appelOffre.setStatut(StatutAppelOffre.CLOS);
        appelOffreRepository.save(appelOffre);
    }
}

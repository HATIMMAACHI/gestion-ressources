package com.faculte.gestion_ressources.service.impl;

import com.faculte.gestion_ressources.dto.request.ReunionRequest;
import com.faculte.gestion_ressources.dto.response.ReunionResponse;
import com.faculte.gestion_ressources.entity.Besoin;
import com.faculte.gestion_ressources.entity.Departement;
import com.faculte.gestion_ressources.entity.Reunion;
import com.faculte.gestion_ressources.entity.User;
import com.faculte.gestion_ressources.enums.StatutBesoin;
import com.faculte.gestion_ressources.enums.StatutReunion;
import com.faculte.gestion_ressources.exception.AppException;
import com.faculte.gestion_ressources.mapper.ReunionMapper;
import com.faculte.gestion_ressources.repository.BesoinRepository;
import com.faculte.gestion_ressources.repository.DepartementRepository;
import com.faculte.gestion_ressources.repository.ReunionRepository;
import com.faculte.gestion_ressources.repository.UserRepository;
import com.faculte.gestion_ressources.service.ReunionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReunionServiceImpl implements ReunionService {

    private final ReunionRepository reunionRepository;
    private final BesoinRepository besoinRepository;
    private final DepartementRepository departementRepository;
    private final UserRepository userRepository;
    private final ReunionMapper reunionMapper;

    @Override
    @Transactional
    public ReunionResponse create(ReunionRequest request, String chefEmail) {
        User chef = userRepository.findByEmail(chefEmail)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Chef non trouvé"));
        Departement dept = departementRepository.findById(request.getDepartementId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Département non trouvé"));

        Reunion reunion = Reunion.builder()
                .departement(dept)
                .chefDept(chef)
                .dateConvocation(LocalDateTime.now())
                .statut(StatutReunion.CONVOQUEE)
                .notes(request.getNotes())
                .build();
        
        reunionRepository.save(reunion);

        Set<UUID> besoinIds = new HashSet<>(request.getBesoinIds());
        if (besoinIds.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Au moins un besoin doit être sélectionné");
        }

        List<Besoin> besoins = besoinRepository.findAllById(besoinIds);
        if (besoins.size() != besoinIds.size()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Certains besoins sélectionnés sont introuvables");
        }

        boolean wrongDepartement = besoins.stream().anyMatch(b ->
                b.getDepartement() == null || !dept.getId().equals(b.getDepartement().getId()));
        if (wrongDepartement) {
            throw new AppException(HttpStatus.FORBIDDEN, "Certains besoins ne sont pas autorisés pour ce département");
        }

        boolean invalidStatus = besoins.stream().anyMatch(b -> b.getStatut() != StatutBesoin.BROUILLON);
        if (invalidStatus) {
            throw new AppException(HttpStatus.CONFLICT, "Seuls les besoins en brouillon peuvent être ajoutés à la réunion");
        }

        besoins.forEach(b -> {
            b.setStatut(StatutBesoin.EN_REUNION);
            b.setReunion(reunion);
        });
        besoinRepository.saveAll(besoins);

        return reunionMapper.toResponse(reunion);
    }

    @Override
    @Transactional
    public void cloturer(UUID id) {
        Reunion reunion = reunionRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Réunion non trouvée"));

        if (reunion.getStatut() != StatutReunion.CONVOQUEE) {
            throw new AppException(HttpStatus.CONFLICT, "La réunion n'est pas ouverte");
        }

        reunion.setStatut(StatutReunion.CLOTUREE);
        reunionRepository.save(reunion);

        // Passe tous les besoins EN_REUNION -> VALIDE
        List<Besoin> besoins = besoinRepository.findByDepartementIdAndStatut(reunion.getDepartement().getId(), StatutBesoin.EN_REUNION);
        besoins.forEach(b -> b.setStatut(StatutBesoin.VALIDE));
        besoinRepository.saveAll(besoins);
    }

    @Override
    public List<ReunionResponse> findAll(UUID departementId, StatutReunion statut) {
        List<Reunion> reunions;
        if (departementId != null && statut != null) {
            reunions = reunionRepository.findByDepartementIdAndStatut(departementId, statut);
        } else if (departementId != null) {
            reunions = reunionRepository.findByDepartementId(departementId);
        } else {
            reunions = reunionRepository.findAll();
        }
        return reunions.stream().map(reunionMapper::toResponse).collect(Collectors.toList());
    }
}

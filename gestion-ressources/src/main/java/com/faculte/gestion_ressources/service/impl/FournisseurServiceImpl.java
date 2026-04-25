package com.faculte.gestion_ressources.service.impl;

import com.faculte.gestion_ressources.dto.request.BannirFournisseurRequest;
import com.faculte.gestion_ressources.dto.request.FournisseurRequest;
import com.faculte.gestion_ressources.dto.response.FournisseurResponse;
import com.faculte.gestion_ressources.entity.Fournisseur;
import com.faculte.gestion_ressources.entity.User;
import com.faculte.gestion_ressources.enums.NotificationType;
import com.faculte.gestion_ressources.exception.AppException;
import com.faculte.gestion_ressources.mapper.FournisseurMapper;
import com.faculte.gestion_ressources.repository.FournisseurRepository;
import com.faculte.gestion_ressources.repository.UserRepository;
import com.faculte.gestion_ressources.service.FournisseurService;
import com.faculte.gestion_ressources.service.NotificationService;
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
public class FournisseurServiceImpl implements FournisseurService {

    private final FournisseurRepository fournisseurRepository;
    private final UserRepository userRepository;
    private final FournisseurMapper fournisseurMapper;
    private final NotificationService notificationService;

    @Override
    public List<FournisseurResponse> findAll(Boolean estListeNoire) {
        List<Fournisseur> list = (estListeNoire != null) ?
                fournisseurRepository.findByEstListeNoire(estListeNoire) :
                fournisseurRepository.findAll();
        return list.stream().map(fournisseurMapper::toResponse).collect(Collectors.toList());
    }

        @Override
        public FournisseurResponse findMyProfile(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé"));

        Fournisseur fournisseur = fournisseurRepository.findById(user.getId())
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Profil fournisseur non trouvé"));

        return fournisseurMapper.toResponse(fournisseur);
        }

    @Override
    @Transactional
    public FournisseurResponse update(UUID id, FournisseurRequest request) {
        Fournisseur fournisseur = fournisseurRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Fournisseur non trouvé"));

        fournisseur.setAdresse(request.getAdresse());
        fournisseur.setSiteWeb(request.getSiteWeb());
        fournisseur.setGerant(request.getGerant());

        return fournisseurMapper.toResponse(fournisseurRepository.save(fournisseur));
    }

    @Override
    @Transactional
    public void bannir(UUID id, BannirFournisseurRequest request) {
        Fournisseur fournisseur = fournisseurRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Fournisseur non trouvé"));

        if (fournisseur.getEstListeNoire() != null && fournisseur.getEstListeNoire()) {
            throw new AppException(HttpStatus.CONFLICT, "Le fournisseur est déjà banni");
        }

        fournisseur.setEstListeNoire(true);
        fournisseur.setMotifBannissement(request.getMotif());
        fournisseurRepository.save(fournisseur);

        Map<String, Object> payload = new HashMap<>();
        payload.put("motif", request.getMotif());
        payload.put("dateElimination", LocalDate.now().toString());
        notificationService.send(fournisseur.getId(), NotificationType.BANNISSEMENT, payload);
    }

    @Override
    @Transactional
    public void rehabiliter(UUID id) {
        Fournisseur fournisseur = fournisseurRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Fournisseur non trouvé"));

        if (fournisseur.getEstListeNoire() == null || !fournisseur.getEstListeNoire()) {
            throw new AppException(HttpStatus.CONFLICT, "Le fournisseur n'est pas banni");
        }

        fournisseur.setEstListeNoire(false);
        fournisseur.setMotifBannissement(null);
        fournisseurRepository.save(fournisseur);
    }

    @Override
    public void checkBlacklist(UUID fournisseurId) {
        Fournisseur fournisseur = fournisseurRepository.findById(fournisseurId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Fournisseur non trouvé"));
        if (fournisseur.getEstListeNoire() != null && fournisseur.getEstListeNoire()) {
            throw new AppException(HttpStatus.FORBIDDEN, "Fournisseur banni : " + fournisseur.getMotifBannissement());
        }
    }
}

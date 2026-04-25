package com.faculte.gestion_ressources.service;

import com.faculte.gestion_ressources.dto.request.OffreRequest;
import com.faculte.gestion_ressources.dto.response.OffreResponse;
import com.faculte.gestion_ressources.enums.StatutOffre;

import java.util.List;
import java.util.UUID;

public interface OffreService {
    OffreResponse create(OffreRequest request, String fournisseurEmail);
    List<OffreResponse> findAll(StatutOffre statut);
    List<OffreResponse> findAllByAppelOffre(UUID appelOffreId, String currentUserEmail);
    OffreResponse findById(UUID id, String currentUserEmail);
    List<OffreResponse> findMine(String currentUserEmail);
    void selectionner(UUID id);
    void selectionnerMoinsDisant(UUID appelOffreId);
}

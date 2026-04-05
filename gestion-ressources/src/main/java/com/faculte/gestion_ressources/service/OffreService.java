package com.faculte.gestion_ressources.service;

import com.faculte.gestion_ressources.dto.request.OffreRequest;
import com.faculte.gestion_ressources.dto.response.OffreResponse;

import java.util.List;
import java.util.UUID;

public interface OffreService {
    OffreResponse create(OffreRequest request, String fournisseurEmail);
    List<OffreResponse> findAllByAppelOffre(UUID appelOffreId);
    OffreResponse findById(UUID id);
    void selectionner(UUID id);
}

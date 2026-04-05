package com.faculte.gestion_ressources.service;

import com.faculte.gestion_ressources.dto.request.ReunionRequest;
import com.faculte.gestion_ressources.dto.response.ReunionResponse;
import com.faculte.gestion_ressources.enums.StatutReunion;

import java.util.List;
import java.util.UUID;

public interface ReunionService {
    ReunionResponse create(ReunionRequest request, String chefEmail);
    void cloturer(UUID id);
    List<ReunionResponse> findAll(UUID departementId, StatutReunion statut);
}

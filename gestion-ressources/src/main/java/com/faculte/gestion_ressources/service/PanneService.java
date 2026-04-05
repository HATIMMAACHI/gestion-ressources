package com.faculte.gestion_ressources.service;

import com.faculte.gestion_ressources.dto.request.ConstatRequest;
import com.faculte.gestion_ressources.dto.request.DecisionRequest;
import com.faculte.gestion_ressources.dto.request.PanneRequest;
import com.faculte.gestion_ressources.dto.request.PanneStatusRequest;
import com.faculte.gestion_ressources.dto.response.PanneResponse;
import com.faculte.gestion_ressources.enums.StatutPanne;

import java.util.List;
import java.util.UUID;

public interface PanneService {
    PanneResponse create(PanneRequest request, String signalerEmail);
    List<PanneResponse> findAll(StatutPanne statut, UUID ressourceTypeId);
    PanneResponse findById(UUID id);
    PanneResponse updateStatut(UUID id, PanneStatusRequest request);
    PanneResponse addConstat(UUID panneId, ConstatRequest request, String technicienEmail);
    PanneResponse addDecision(UUID panneId, DecisionRequest request);
}

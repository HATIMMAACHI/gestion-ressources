package com.faculte.gestion_ressources.service;

import com.faculte.gestion_ressources.dto.request.AffectationRequest;
import com.faculte.gestion_ressources.dto.response.AffectationResponse;
import com.faculte.gestion_ressources.enums.TypeAffectation;

import java.util.List;
import java.util.UUID;

public interface AffectationService {
    AffectationResponse create(AffectationRequest request);
    List<AffectationResponse> findAll(UUID departementId, TypeAffectation typeAffectation, Boolean actif, UUID utilisateurId);
    AffectationResponse update(UUID id, AffectationRequest request);
    void delete(UUID id);
}

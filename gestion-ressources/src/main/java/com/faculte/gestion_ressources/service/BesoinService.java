package com.faculte.gestion_ressources.service;

import com.faculte.gestion_ressources.dto.request.BesoinRequest;
import com.faculte.gestion_ressources.dto.request.BesoinStatusRequest;
import com.faculte.gestion_ressources.dto.response.BesoinResponse;
import com.faculte.gestion_ressources.enums.StatutBesoin;

import java.util.List;
import java.util.UUID;

public interface BesoinService {
    BesoinResponse create(BesoinRequest request);
    List<BesoinResponse> findAll(UUID departementId, StatutBesoin statut);
    BesoinResponse update(UUID id, BesoinRequest request);
    BesoinResponse updateStatus(UUID id, BesoinStatusRequest request);
    void delete(UUID id);
}

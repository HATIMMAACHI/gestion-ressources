package com.faculte.gestion_ressources.service;

import com.faculte.gestion_ressources.dto.request.BannirFournisseurRequest;
import com.faculte.gestion_ressources.dto.request.FournisseurRequest;
import com.faculte.gestion_ressources.dto.response.FournisseurResponse;

import java.util.List;
import java.util.UUID;

public interface FournisseurService {
    List<FournisseurResponse> findAll(Boolean estListeNoire);
    FournisseurResponse update(UUID id, FournisseurRequest request);
    void bannir(UUID id, BannirFournisseurRequest request);
    void rehabiliter(UUID id);
    void checkBlacklist(UUID fournisseurId);
}

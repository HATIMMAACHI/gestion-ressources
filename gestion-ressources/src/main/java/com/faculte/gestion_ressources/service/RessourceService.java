package com.faculte.gestion_ressources.service;

import com.faculte.gestion_ressources.dto.request.RessourceRequest;
import com.faculte.gestion_ressources.dto.response.RessourceResponse;
import com.faculte.gestion_ressources.enums.EtatRessource;
import com.faculte.gestion_ressources.enums.TypeRessource;

import java.util.List;
import java.util.UUID;

public interface RessourceService {
    RessourceResponse create(RessourceRequest request, String responsableEmail);
    List<RessourceResponse> findAll(TypeRessource type, EtatRessource etat, UUID fournisseurId);
    RessourceResponse findById(UUID id);
    RessourceResponse update(UUID id, RessourceRequest request);
    void delete(UUID id);
}

package com.faculte.gestion_ressources.service;

import com.faculte.gestion_ressources.dto.request.AppelOffreRequest;
import com.faculte.gestion_ressources.dto.response.AffectationPrevueResponse;
import com.faculte.gestion_ressources.dto.response.AppelOffreResponse;

import java.util.List;
import java.util.UUID;

public interface AppelOffreService {
    AppelOffreResponse create(AppelOffreRequest request, String responsableEmail);
    List<AppelOffreResponse> findAll();
    AppelOffreResponse findById(UUID id);
    List<AffectationPrevueResponse> getAffectationsPrevues(UUID id);
    void clore(UUID id);
}

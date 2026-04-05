package com.faculte.gestion_ressources.controller;

import com.faculte.gestion_ressources.dto.request.AppelOffreRequest;
import com.faculte.gestion_ressources.dto.response.AffectationPrevueResponse;
import com.faculte.gestion_ressources.dto.response.AppelOffreResponse;
import com.faculte.gestion_ressources.exception.ApiResponse;
import com.faculte.gestion_ressources.service.AppelOffreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/appels-offre")
@RequiredArgsConstructor
public class AppelOffreController {

    private final AppelOffreService appelOffreService;

    @PostMapping
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<ApiResponse<AppelOffreResponse>> create(@Valid @RequestBody AppelOffreRequest request, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(appelOffreService.create(request, authentication.getName()), "Appel d'offre créé avec affectations prévues"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RESPONSABLE', 'CHEF_DEPT', 'FOURNISSEUR')")
    public ResponseEntity<ApiResponse<List<AppelOffreResponse>>> findAll() {
        return ResponseEntity.ok(ApiResponse.success(appelOffreService.findAll(), "Appels d'offre récupérés"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RESPONSABLE', 'CHEF_DEPT', 'FOURNISSEUR', 'TECHNICIEN')")
    public ResponseEntity<ApiResponse<AppelOffreResponse>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(appelOffreService.findById(id), "Appel d'offre récupéré"));
    }

    @GetMapping("/{id}/affectations-prevues")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<ApiResponse<List<AffectationPrevueResponse>>> getAffectationsPrevues(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(appelOffreService.getAffectationsPrevues(id), "Affectations prévues récupérées"));
    }

    @PatchMapping("/{id}/clore")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<ApiResponse<Void>> clore(@PathVariable UUID id) {
        appelOffreService.clore(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Appel d'offre clos"));
    }
}

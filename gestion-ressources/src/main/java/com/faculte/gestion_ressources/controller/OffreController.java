package com.faculte.gestion_ressources.controller;

import com.faculte.gestion_ressources.dto.request.OffreRequest;
import com.faculte.gestion_ressources.dto.response.OffreResponse;
import com.faculte.gestion_ressources.exception.ApiResponse;
import com.faculte.gestion_ressources.service.OffreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/offres")
@RequiredArgsConstructor
public class OffreController {

    private final OffreService offreService;

    @PostMapping
    @PreAuthorize("hasRole('FOURNISSEUR')")
    public ResponseEntity<ApiResponse<OffreResponse>> create(@Valid @RequestBody OffreRequest request, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(offreService.create(request, authentication.getName()), "Offre soumise"));
    }

    @GetMapping("/appel-offre/{appelOffreId}")
    @PreAuthorize("hasAnyRole('RESPONSABLE', 'FOURNISSEUR')")
    public ResponseEntity<ApiResponse<List<OffreResponse>>> findAllByAppelOffre(@PathVariable UUID appelOffreId) {
        return ResponseEntity.ok(ApiResponse.success(offreService.findAllByAppelOffre(appelOffreId), "Offres récupérées"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RESPONSABLE', 'FOURNISSEUR')")
    public ResponseEntity<ApiResponse<OffreResponse>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(offreService.findById(id), "Offre récupérée"));
    }

    @PostMapping("/{id}/selectionner")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<ApiResponse<Void>> selectionner(@PathVariable UUID id) {
        offreService.selectionner(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Offre sélectionnée et autres rejetées"));
    }
}

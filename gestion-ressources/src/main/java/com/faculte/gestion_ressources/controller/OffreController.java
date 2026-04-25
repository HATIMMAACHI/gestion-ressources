package com.faculte.gestion_ressources.controller;

import com.faculte.gestion_ressources.dto.request.OffreRequest;
import com.faculte.gestion_ressources.dto.response.OffreResponse;
import com.faculte.gestion_ressources.enums.StatutOffre;
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

    @GetMapping
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<ApiResponse<List<OffreResponse>>> findAll(@RequestParam(required = false) StatutOffre statut) {
        return ResponseEntity.ok(ApiResponse.success(offreService.findAll(statut), "Offres récupérées"));
    }

    @GetMapping("/appel-offre/{appelOffreId}")
    @PreAuthorize("hasAnyRole('RESPONSABLE', 'FOURNISSEUR')")
    public ResponseEntity<ApiResponse<List<OffreResponse>>> findAllByAppelOffre(@PathVariable UUID appelOffreId, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(offreService.findAllByAppelOffre(appelOffreId, authentication.getName()), "Offres récupérées"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RESPONSABLE', 'FOURNISSEUR')")
    public ResponseEntity<ApiResponse<OffreResponse>> findById(@PathVariable UUID id, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(offreService.findById(id, authentication.getName()), "Offre récupérée"));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('FOURNISSEUR')")
    public ResponseEntity<ApiResponse<List<OffreResponse>>> findMine(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(offreService.findMine(authentication.getName()), "Offres du fournisseur récupérées"));
    }

    @PostMapping("/{id}/selectionner")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<ApiResponse<Void>> selectionner(@PathVariable UUID id) {
        offreService.selectionner(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Offre sélectionnée et autres rejetées"));
    }

    @PostMapping("/appel-offre/{appelOffreId}/selectionner-moins-disant")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<ApiResponse<Void>> selectionnerMoinsDisant(@PathVariable UUID appelOffreId) {
        offreService.selectionnerMoinsDisant(appelOffreId);
        return ResponseEntity.ok(ApiResponse.success(null, "Offre la moins disante sélectionnée"));
    }
}

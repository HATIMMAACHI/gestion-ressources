package com.faculte.gestion_ressources.controller;

import com.faculte.gestion_ressources.dto.request.RessourceRequest;
import com.faculte.gestion_ressources.dto.response.RessourceResponse;
import com.faculte.gestion_ressources.enums.EtatRessource;
import com.faculte.gestion_ressources.enums.TypeRessource;
import com.faculte.gestion_ressources.exception.ApiResponse;
import com.faculte.gestion_ressources.service.RessourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ressources")
@RequiredArgsConstructor
public class RessourceController {

    private final RessourceService ressourceService;

    @PostMapping
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<ApiResponse<RessourceResponse>> create(@Valid @RequestBody RessourceRequest request, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(ressourceService.create(request, authentication.getName()), "Ressource enregistrée"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RESPONSABLE', 'CHEF_DEPT', ' TECHNICIEN')")
    public ResponseEntity<ApiResponse<List<RessourceResponse>>> findAll(
            @RequestParam(required = false) TypeRessource type,
            @RequestParam(required = false) EtatRessource etat,
            @RequestParam(required = false) UUID fournisseurId) {
        return ResponseEntity.ok(ApiResponse.success(ressourceService.findAll(type, etat, fournisseurId), "Ressources récupérées"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RESPONSABLE', 'CHEF_DEPT', ' TECHNICIEN')")
    public ResponseEntity<ApiResponse<RessourceResponse>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(ressourceService.findById(id), "Ressource récupérée"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<ApiResponse<RessourceResponse>> update(@PathVariable UUID id, @Valid @RequestBody RessourceRequest request) {
        return ResponseEntity.ok(ApiResponse.success(ressourceService.update(id, request), "Ressource mise à jour"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        ressourceService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Ressource supprimée"));
    }
}

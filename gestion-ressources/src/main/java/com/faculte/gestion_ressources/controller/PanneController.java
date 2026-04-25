package com.faculte.gestion_ressources.controller;

import com.faculte.gestion_ressources.dto.request.ConstatRequest;
import com.faculte.gestion_ressources.dto.request.DecisionRequest;
import com.faculte.gestion_ressources.dto.request.PanneRequest;
import com.faculte.gestion_ressources.dto.request.PanneStatusRequest;
import com.faculte.gestion_ressources.dto.response.PanneResponse;
import com.faculte.gestion_ressources.enums.StatutPanne;
import com.faculte.gestion_ressources.exception.ApiResponse;
import com.faculte.gestion_ressources.service.PanneService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pannes")
@RequiredArgsConstructor
public class PanneController {

    private final PanneService panneService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ENSEIGNANT', 'CHEF_DEPT', 'RESPONSABLE')")
    public ResponseEntity<ApiResponse<PanneResponse>> signal(@Valid @RequestBody PanneRequest request, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(panneService.create(request, authentication.getName()), "Panne signalée"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RESPONSABLE', 'TECHNICIEN', 'CHEF_DEPT', 'ENSEIGNANT')")
    public ResponseEntity<ApiResponse<List<PanneResponse>>> findAll(
            @RequestParam(required = false) StatutPanne statut,
            @RequestParam(required = false) UUID ressourceTypeId,
            Authentication authentication) {
        if (authentication != null && authentication.getAuthorities().stream().anyMatch(a -> "ROLE_ENSEIGNANT".equals(a.getAuthority()))) {
            return ResponseEntity.ok(ApiResponse.success(panneService.findMine(statut, authentication.getName()), "Pannes récupérées"));
        }
        return ResponseEntity.ok(ApiResponse.success(panneService.findAll(statut, ressourceTypeId), "Pannes récupérées"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RESPONSABLE', 'TECHNICIEN', 'CHEF_DEPT', 'ENSEIGNANT')")
    public ResponseEntity<ApiResponse<PanneResponse>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(panneService.findById(id), "Panne récupérée"));
    }

    @PatchMapping("/{id}/statut")
    @PreAuthorize("hasAnyRole('RESPONSABLE', 'TECHNICIEN')")
    public ResponseEntity<ApiResponse<PanneResponse>> updateStatut(@PathVariable UUID id, @Valid @RequestBody PanneStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success(panneService.updateStatut(id, request), "Statut de la panne mis à jour"));
    }

    @PostMapping("/{id}/constats")
    @PreAuthorize("hasRole('TECHNICIEN')")
    public ResponseEntity<ApiResponse<PanneResponse>> addConstat(@PathVariable UUID id, @Valid @RequestBody ConstatRequest request, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(panneService.addConstat(id, request, authentication.getName()), "Constat ajouté"));
    }

    @PostMapping("/{id}/decisions")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<ApiResponse<PanneResponse>> addDecision(@PathVariable UUID id, @Valid @RequestBody DecisionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(panneService.addDecision(id, request), "Décision enregistrée"));
    }
}

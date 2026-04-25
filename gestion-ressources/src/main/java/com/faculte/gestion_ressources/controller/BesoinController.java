package com.faculte.gestion_ressources.controller;

import com.faculte.gestion_ressources.dto.request.BesoinRequest;
import com.faculte.gestion_ressources.dto.request.BesoinStatusRequest;
import com.faculte.gestion_ressources.dto.response.BesoinResponse;
import com.faculte.gestion_ressources.enums.StatutBesoin;
import com.faculte.gestion_ressources.exception.ApiResponse;
import com.faculte.gestion_ressources.service.BesoinService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/besoins")
@RequiredArgsConstructor
public class BesoinController {

    private final BesoinService besoinService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ENSEIGNANT', 'CHEF_DEPT')")
    public ResponseEntity<ApiResponse<BesoinResponse>> create(@Valid @RequestBody BesoinRequest request) {
        // Technically request should supply current user info implicitly via JWT, we assume Service handles it or UI passes demandeurId.
        return ResponseEntity.ok(ApiResponse.success(besoinService.create(request), "Besoin créé"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('CHEF_DEPT', 'RESPONSABLE', 'ENSEIGNANT')")
    public ResponseEntity<ApiResponse<List<BesoinResponse>>> findAll(
            @RequestParam(required = false) UUID departementId,
            @RequestParam(required = false) StatutBesoin statut) {
        return ResponseEntity.ok(ApiResponse.success(besoinService.findAll(departementId, statut), "Besoins récupérés"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('CHEF_DEPT', 'ENSEIGNANT')")
    public ResponseEntity<ApiResponse<BesoinResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody BesoinRequest request) {
        return ResponseEntity.ok(ApiResponse.success(besoinService.update(id, request), "Besoin mis à jour"));
    }

    @PatchMapping("/{id}/statut")
    @PreAuthorize("hasAnyRole('CHEF_DEPT', 'RESPONSABLE')")
    public ResponseEntity<ApiResponse<BesoinResponse>> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody BesoinStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success(besoinService.updateStatus(id, request), "Statut du besoin mis à jour"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('CHEF_DEPT', 'ENSEIGNANT')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        besoinService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Besoin supprimé"));
    }
}

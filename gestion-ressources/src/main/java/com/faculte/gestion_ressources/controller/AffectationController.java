package com.faculte.gestion_ressources.controller;

import com.faculte.gestion_ressources.dto.request.AffectationRequest;
import com.faculte.gestion_ressources.dto.response.AffectationResponse;
import com.faculte.gestion_ressources.enums.TypeAffectation;
import com.faculte.gestion_ressources.exception.ApiResponse;
import com.faculte.gestion_ressources.service.AffectationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/affectations")
@RequiredArgsConstructor
public class AffectationController {

    private final AffectationService affectationService;

    @PostMapping
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<ApiResponse<AffectationResponse>> create(@Valid @RequestBody AffectationRequest request) {
        return ResponseEntity.ok(ApiResponse.success(affectationService.create(request), "Affectation créée"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RESPONSABLE', 'CHEF_DEPT')")
    public ResponseEntity<ApiResponse<List<AffectationResponse>>> findAll(
            @RequestParam(required = false) UUID departementId,
            @RequestParam(required = false) TypeAffectation typeAffectation,
            @RequestParam(required = false) Boolean actif) {
        return ResponseEntity.ok(ApiResponse.success(affectationService.findAll(departementId, typeAffectation, actif), "Affectations récupérées"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<ApiResponse<AffectationResponse>> update(@PathVariable UUID id, @Valid @RequestBody AffectationRequest request) {
        return ResponseEntity.ok(ApiResponse.success(affectationService.update(id, request), "Affectation modifiée"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        affectationService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Affectation annulée (historisée)"));
    }
}

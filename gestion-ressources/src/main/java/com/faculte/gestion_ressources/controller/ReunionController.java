package com.faculte.gestion_ressources.controller;

import com.faculte.gestion_ressources.dto.request.ReunionRequest;
import com.faculte.gestion_ressources.dto.response.ReunionResponse;
import com.faculte.gestion_ressources.enums.StatutReunion;
import com.faculte.gestion_ressources.exception.ApiResponse;
import com.faculte.gestion_ressources.service.ReunionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reunions")
@RequiredArgsConstructor
public class ReunionController {

    private final ReunionService reunionService;

    @PostMapping
    @PreAuthorize("hasRole('CHEF_DEPT')")
    public ResponseEntity<ApiResponse<ReunionResponse>> create(@Valid @RequestBody ReunionRequest request, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(reunionService.create(request, authentication.getName()), "Réunion convoquée"));
    }

    @PutMapping("/{id}/cloturer")
    @PreAuthorize("hasRole('CHEF_DEPT')")
    public ResponseEntity<ApiResponse<Void>> cloturer(@PathVariable UUID id) {
        reunionService.cloturer(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Réunion clôturée"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('CHEF_DEPT', 'RESPONSABLE')")
    public ResponseEntity<ApiResponse<List<ReunionResponse>>> findAll(
            @RequestParam(required = false) UUID departementId,
            @RequestParam(required = false) StatutReunion statut) {
        return ResponseEntity.ok(ApiResponse.success(reunionService.findAll(departementId, statut), "Réunions récupérées"));
    }
}

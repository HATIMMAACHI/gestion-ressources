package com.faculte.gestion_ressources.controller;

import com.faculte.gestion_ressources.dto.request.BannirFournisseurRequest;
import com.faculte.gestion_ressources.dto.request.FournisseurRequest;
import com.faculte.gestion_ressources.dto.response.FournisseurResponse;
import com.faculte.gestion_ressources.exception.ApiResponse;
import com.faculte.gestion_ressources.service.FournisseurService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/fournisseurs")
@RequiredArgsConstructor
public class FournisseurController {

    private final FournisseurService fournisseurService;

    @GetMapping
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<ApiResponse<List<FournisseurResponse>>> findAll(@RequestParam(required = false) Boolean estListeNoire) {
        return ResponseEntity.ok(ApiResponse.success(fournisseurService.findAll(estListeNoire), "Fournisseurs récupérés"));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('FOURNISSEUR')")
    public ResponseEntity<ApiResponse<FournisseurResponse>> findMe(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(fournisseurService.findMyProfile(authentication.getName()), "Profil fournisseur récupéré"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<ApiResponse<FournisseurResponse>> update(@PathVariable UUID id, @Valid @RequestBody FournisseurRequest request) {
        return ResponseEntity.ok(ApiResponse.success(fournisseurService.update(id, request), "Fournisseur mis à jour"));
    }

    @PostMapping("/{id}/bannir")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<ApiResponse<Void>> bannir(@PathVariable UUID id, @Valid @RequestBody BannirFournisseurRequest request) {
        fournisseurService.bannir(id, request);
        return ResponseEntity.ok(ApiResponse.success(null, "Fournisseur banni"));
    }

    @PostMapping("/{id}/rehabiliter")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<ApiResponse<Void>> rehabiliter(@PathVariable UUID id) {
        fournisseurService.rehabiliter(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Fournisseur réhabilité"));
    }
}

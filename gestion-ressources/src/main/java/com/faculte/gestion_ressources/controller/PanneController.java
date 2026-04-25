package com.faculte.gestion_ressources.controller;

import com.faculte.gestion_ressources.dto.request.ConstatRequest;
import com.faculte.gestion_ressources.dto.request.DecisionRequest;
import com.faculte.gestion_ressources.dto.request.PanneRequest;
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

    /** 1. Enseignant signale une panne */
    @PostMapping
    @PreAuthorize("hasAnyRole('ENSEIGNANT', 'CHEF_DEPT', 'RESPONSABLE')")
    public ResponseEntity<ApiResponse<PanneResponse>> signal(@Valid @RequestBody PanneRequest request, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(panneService.create(request, authentication.getName()), "Panne signalée"));
    }

    /** 2. Technicien prend en charge la panne (OUVERTE → EN_COURS) */
    @PatchMapping("/{id}/prendre-en-charge")
    @PreAuthorize("hasRole('TECHNICIEN')")
    public ResponseEntity<ApiResponse<PanneResponse>> prendreEnCharge(@PathVariable UUID id, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(panneService.prendreEnCharge(id, authentication.getName()), "Panne prise en charge"));
    }

    /** 3. Technicien/Fournisseur résout (EN_COURS ou ENVOYEE_FOURNISSEUR → RESOLUE) */
    @PatchMapping("/{id}/resoudre")
    @PreAuthorize("hasAnyRole('TECHNICIEN', 'FOURNISSEUR')")
    public ResponseEntity<ApiResponse<PanneResponse>> resolveDirectly(@PathVariable UUID id, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(panneService.resolveDirectly(id, authentication.getName()), "Panne résolue"));
    }

    /** 4. Technicien rédige un constat (EN_COURS → EN_ATTENTE_DECISION) */
    @PostMapping("/{id}/constats")
    @PreAuthorize("hasRole('TECHNICIEN')")
    public ResponseEntity<ApiResponse<PanneResponse>> addConstat(@PathVariable UUID id, @Valid @RequestBody ConstatRequest request, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(panneService.addConstat(id, request, authentication.getName()), "Constat ajouté et notification envoyée au responsable"));
    }

    /** 5. Responsable prend une décision (EN_ATTENTE_DECISION → ENVOYEE_FOURNISSEUR) */
    @PostMapping("/{id}/decisions")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<ApiResponse<PanneResponse>> addDecision(@PathVariable UUID id, @Valid @RequestBody DecisionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(panneService.addDecision(id, request), "Décision enregistrée et notification envoyée au fournisseur"));
    }

    /** Lister toutes les pannes (avec filtre optionnel par statut et rôle) */
    @GetMapping
    @PreAuthorize("hasAnyRole('RESPONSABLE', 'TECHNICIEN', 'CHEF_DEPT', 'ENSEIGNANT', 'FOURNISSEUR')")
    public ResponseEntity<ApiResponse<List<PanneResponse>>> findAll(
            @RequestParam(required = false) StatutPanne statut,
            @RequestParam(required = false) UUID ressourceTypeId,
            Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        
        // Les enseignants et fournisseurs ont une vue filtrée par défaut
        if (authentication != null) {
            boolean isEnseignant = authentication.getAuthorities().stream().anyMatch(a -> "ROLE_ENSEIGNANT".equals(a.getAuthority()));
            boolean isFournisseur = authentication.getAuthorities().stream().anyMatch(a -> "ROLE_FOURNISSEUR".equals(a.getAuthority()));
            
            if (isEnseignant || isFournisseur) {
                return ResponseEntity.ok(ApiResponse.success(panneService.findMine(statut, email), "Pannes récupérées"));
            }
        }
        
        return ResponseEntity.ok(ApiResponse.success(panneService.findAll(statut, ressourceTypeId), "Pannes récupérées"));
    }

    /** Détail d'une panne */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RESPONSABLE', 'TECHNICIEN', 'CHEF_DEPT', 'ENSEIGNANT', 'FOURNISSEUR')")
    public ResponseEntity<ApiResponse<PanneResponse>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(panneService.findById(id), "Panne récupérée"));
    }
}

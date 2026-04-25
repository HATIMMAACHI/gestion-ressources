package com.faculte.gestion_ressources.controller;

import com.faculte.gestion_ressources.dto.response.DepartementResponse;
import com.faculte.gestion_ressources.exception.ApiResponse;
import com.faculte.gestion_ressources.repository.DepartementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/departements")
@RequiredArgsConstructor
public class DepartementController {

    private final DepartementRepository departementRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ENSEIGNANT', 'CHEF_DEPT', 'RESPONSABLE', 'TECHNICIEN', 'FOURNISSEUR')")
    public ResponseEntity<ApiResponse<List<DepartementResponse>>> findAll() {
        List<DepartementResponse> data = departementRepository.findAll().stream()
                .map(item -> DepartementResponse.builder()
                        .id(item.getId())
                        .nom(item.getNom())
                        .budget(item.getBudget())
                        .build())
                .toList();

        return ResponseEntity.ok(ApiResponse.success(data, "Départements récupérés"));
    }
}

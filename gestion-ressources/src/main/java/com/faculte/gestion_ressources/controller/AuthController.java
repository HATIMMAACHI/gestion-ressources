package com.faculte.gestion_ressources.controller;

import com.faculte.gestion_ressources.dto.request.LoginRequest;
import com.faculte.gestion_ressources.dto.request.RegisterFournisseurRequest;
import com.faculte.gestion_ressources.dto.response.LoginResponse;
import com.faculte.gestion_ressources.dto.response.UserResponse;
import com.faculte.gestion_ressources.exception.ApiResponse;
import com.faculte.gestion_ressources.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.authenticate(request), "Connexion réussie"));
    }

    @PostMapping("/register-fournisseur")
    public ResponseEntity<ApiResponse<UserResponse>> registerFournisseur(@Valid @RequestBody RegisterFournisseurRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.registerFournisseur(request), "Fournisseur inscrit avec succès"));
    }
}

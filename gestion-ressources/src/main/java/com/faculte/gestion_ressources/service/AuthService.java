package com.faculte.gestion_ressources.service;

import com.faculte.gestion_ressources.dto.request.LoginRequest;
import com.faculte.gestion_ressources.dto.request.RegisterFournisseurRequest;
import com.faculte.gestion_ressources.dto.response.LoginResponse;
import com.faculte.gestion_ressources.dto.response.UserResponse;

public interface AuthService {
    LoginResponse authenticate(LoginRequest request);
    UserResponse registerFournisseur(RegisterFournisseurRequest request);
}

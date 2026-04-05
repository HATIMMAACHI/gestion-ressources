package com.faculte.gestion_ressources.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}

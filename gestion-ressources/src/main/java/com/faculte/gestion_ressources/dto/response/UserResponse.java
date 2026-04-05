package com.faculte.gestion_ressources.dto.response;

import com.faculte.gestion_ressources.enums.Role;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class UserResponse {
    private UUID id;
    private String nom;
    private String email;
    private Role role;
    private UUID departementId;
}

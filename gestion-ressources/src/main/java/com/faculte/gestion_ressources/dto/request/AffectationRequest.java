package com.faculte.gestion_ressources.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class AffectationRequest {
    @NotNull(message = "L'ID de la ressource est requis")
    private UUID ressourceId;

    @NotNull(message = "L'ID du département est requis")
    private UUID departementId;

    private UUID utilisateurId; // Optional: Si null = Départementale
}

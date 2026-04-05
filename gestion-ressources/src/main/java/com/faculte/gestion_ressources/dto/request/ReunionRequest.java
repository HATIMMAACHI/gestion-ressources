package com.faculte.gestion_ressources.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ReunionRequest {
    @NotNull(message = "Le département ID est requis")
    private UUID departementId;

    private String notes;
}

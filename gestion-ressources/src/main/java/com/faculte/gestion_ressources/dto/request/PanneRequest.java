package com.faculte.gestion_ressources.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class PanneRequest {
    @NotNull(message = "L'ID de la ressource est requis")
    private UUID ressourceId;

    @NotBlank(message = "La description est requise")
    private String description;

    @NotNull(message = "La date d'apparition est requise")
    private LocalDate dateApparition;
}

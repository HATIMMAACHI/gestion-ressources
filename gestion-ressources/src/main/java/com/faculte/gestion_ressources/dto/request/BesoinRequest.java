package com.faculte.gestion_ressources.dto.request;

import com.faculte.gestion_ressources.enums.TypeRessource;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class BesoinRequest {
    @NotNull(message = "Le type de ressource est requis")
    private TypeRessource typeRessource;

    @NotNull(message = "La quantité est requise")
    @Min(value = 1, message = "La quantité doit être d'au moins 1")
    private Integer quantite;

    @NotBlank(message = "Les spécifications sont requises")
    private String specs; // Will be parsed to JSON

    @NotBlank(message = "Le motif est requis")
    private String motif;

    private UUID demandeurId; // Nullable
}

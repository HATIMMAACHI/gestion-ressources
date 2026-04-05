package com.faculte.gestion_ressources.dto.request;

import com.faculte.gestion_ressources.enums.TypeRessource;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class RessourceRequest {
    private UUID offreId; // Nullable if generic resource creation without strict bindings

    @NotNull(message = "Le type est requis")
    private TypeRessource type;

    @NotBlank(message = "La marque est requise")
    private String marque;

    @NotBlank(message = "Les spécifications sont requises")
    private String specsJson;

    @NotBlank(message = "Le code d'inventaire est requis")
    private String codeInventaire;

    @NotNull(message = "La date de livraison est requise")
    private LocalDate dateLivraison;
}

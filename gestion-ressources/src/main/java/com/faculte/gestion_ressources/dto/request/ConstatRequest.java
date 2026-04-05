package com.faculte.gestion_ressources.dto.request;

import com.faculte.gestion_ressources.enums.Frequence;
import com.faculte.gestion_ressources.enums.TypePanne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ConstatRequest {
    @NotBlank(message = "L'explication est requise")
    @Size(min = 30, message = "L'explication doit contenir au moins 30 caractères")
    private String explication;

    @NotNull(message = "La fréquence est requise")
    private Frequence frequence;

    @NotNull(message = "Le type de panne est requis")
    private TypePanne typePanne;
}

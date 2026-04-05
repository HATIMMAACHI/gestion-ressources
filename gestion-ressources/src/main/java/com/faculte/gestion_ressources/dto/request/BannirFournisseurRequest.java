package com.faculte.gestion_ressources.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BannirFournisseurRequest {
    @NotBlank(message = "Le motif est requis")
    @Size(min = 20, message = "Le motif doit contenir au moins 20 caractères")
    private String motif;
}

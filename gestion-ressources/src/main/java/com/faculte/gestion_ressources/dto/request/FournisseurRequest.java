package com.faculte.gestion_ressources.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FournisseurRequest {
    @NotBlank(message = "L'adresse est requise")
    private String adresse;
    
    // Website can be left nullable/optional
    private String siteWeb;

    @NotBlank(message = "Le gérant est requis")
    private String gerant;
}

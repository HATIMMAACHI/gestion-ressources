package com.faculte.gestion_ressources.dto.request;

import com.faculte.gestion_ressources.enums.StatutPanne;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PanneStatusRequest {
    @NotNull(message = "Le statut est requis")
    private StatutPanne statut;
}

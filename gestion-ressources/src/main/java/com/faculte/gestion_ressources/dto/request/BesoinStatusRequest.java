package com.faculte.gestion_ressources.dto.request;

import com.faculte.gestion_ressources.enums.StatutBesoin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BesoinStatusRequest {
    @NotNull(message = "Le statut est requis")
    private StatutBesoin statut;
}

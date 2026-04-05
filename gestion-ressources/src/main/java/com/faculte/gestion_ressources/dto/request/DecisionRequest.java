package com.faculte.gestion_ressources.dto.request;

import com.faculte.gestion_ressources.enums.DecisionResponsable;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DecisionRequest {
    @NotNull(message = "La décision est requise")
    private DecisionResponsable decision;
}

package com.faculte.gestion_ressources.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class ReunionRequest {
    @NotNull(message = "Le département ID est requis")
    private UUID departementId;

    @NotEmpty(message = "Au moins un besoin doit être sélectionné")
    private List<UUID> besoinIds;

    private String notes;
}

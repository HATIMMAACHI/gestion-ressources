package com.faculte.gestion_ressources.dto.response;

import com.faculte.gestion_ressources.enums.StatutPanne;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class PanneResponse {
    private UUID id;
    private UUID ressourceId;
    private UUID signaledById;
    private LocalDate dateApparition;
    private String description;
    private StatutPanne statut;
    private ConstatResponse constat;
}

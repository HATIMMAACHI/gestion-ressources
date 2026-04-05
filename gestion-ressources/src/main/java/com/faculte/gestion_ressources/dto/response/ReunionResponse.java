package com.faculte.gestion_ressources.dto.response;

import com.faculte.gestion_ressources.enums.StatutReunion;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ReunionResponse {
    private UUID id;
    private UUID departementId;
    private UUID chefDeptId;
    private LocalDateTime dateConvocation;
    private StatutReunion statut;
    private String notes;
}

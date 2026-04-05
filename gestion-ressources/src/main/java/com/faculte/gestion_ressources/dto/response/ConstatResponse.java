package com.faculte.gestion_ressources.dto.response;

import com.faculte.gestion_ressources.enums.DecisionResponsable;
import com.faculte.gestion_ressources.enums.Frequence;
import com.faculte.gestion_ressources.enums.TypePanne;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class ConstatResponse {
    private UUID id;
    private UUID panneId;
    private UUID technicienId;
    private String explication;
    private Frequence frequence;
    private TypePanne typePanne;
    private DecisionResponsable decisionResponsable;
    private LocalDate dateConstat;
    private Boolean notificationEnvoyee;
}

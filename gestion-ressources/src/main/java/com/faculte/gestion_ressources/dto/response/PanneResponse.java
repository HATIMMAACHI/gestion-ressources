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
    private String ressourceCode;
    private LocalDate dateLivraison;
    private Integer dureeGarantie;
    private Boolean estSousGarantie;
    private UUID signaledById;
    private String signaledByNom;
    private LocalDate dateApparition;
    private String description;
    private StatutPanne statut;
    private Boolean estSevere;
    private ConstatResponse constat;
}

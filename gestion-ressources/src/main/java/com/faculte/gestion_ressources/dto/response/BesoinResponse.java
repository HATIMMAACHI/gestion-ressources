package com.faculte.gestion_ressources.dto.response;

import com.faculte.gestion_ressources.enums.StatutBesoin;
import com.faculte.gestion_ressources.enums.TypeRessource;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class BesoinResponse {
    private UUID id;
    private TypeRessource typeRessource;
    private Integer quantite;
    private String specsJson;
    private UUID demandeurId;
    private UUID departementId;
    private String motif;
    private StatutBesoin statut;
    private UUID appelOffreId;
    private UUID reunionId;
}

package com.faculte.gestion_ressources.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class AffectationPrevueResponse {
    private UUID id;
    private UUID appelOffreId;
    private UUID besoinId;
    private UUID utilisateurId; // null = dept
    private UUID departementId;
}

package com.faculte.gestion_ressources.dto.response;

import com.faculte.gestion_ressources.enums.StatutOffre;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class OffreResponse {
    private UUID id;
    private UUID appelOffreId;
    private UUID fournisseurId;
    private LocalDate dateLivraison;
    private Integer dureeGarantieMois;
    private BigDecimal prixTotal;
    private String detailJson;
    private StatutOffre statut;
}

package com.faculte.gestion_ressources.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class OffreDetailDto {
    private UUID besoinId;
    private String marque;
    private BigDecimal prixUnitaire;
}

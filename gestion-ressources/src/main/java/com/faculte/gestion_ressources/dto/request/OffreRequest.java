package com.faculte.gestion_ressources.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class OffreRequest {
    @NotNull(message = "L'ID de l'appel d'offre est requis")
    private UUID appelOffreId;

    @NotNull(message = "La date de livraison est requise")
    @Future(message = "La date de livraison doit être dans le futur")
    private LocalDate dateLivraison;

    @NotNull(message = "La durée de garantie est requise")
    private Integer dureeGarantieMois;

    @NotNull(message = "Le prix total est requis")
    private BigDecimal prixTotal;

    @NotEmpty(message = "Les détails de l'offre sont requis")
    private List<OffreDetailDto> detail;
}

package com.faculte.gestion_ressources.dto.response;

import com.faculte.gestion_ressources.enums.TypeAffectation;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class AffectationResponse {
    private UUID id;
    private UUID ressourceId;
    private UUID departementId;
    private UUID utilisateurId;
    private LocalDate dateAffectation;
    private Boolean actif;
    private TypeAffectation typeAffectation;
    private String affecteA; // Pour l'affichage formaté "Nom" ou "Département XYZ"
}

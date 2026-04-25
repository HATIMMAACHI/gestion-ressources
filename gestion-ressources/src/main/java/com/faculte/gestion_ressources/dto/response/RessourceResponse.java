package com.faculte.gestion_ressources.dto.response;

import com.faculte.gestion_ressources.enums.EtatRessource;
import com.faculte.gestion_ressources.enums.TypeRessource;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class RessourceResponse {
    private UUID id;
    private String codeInventaire;
    private TypeRessource type;
    private String marque;
    private String specsJson;
    private EtatRessource etat;
    private LocalDate dateLivraison;
    private UUID fournisseurId;
    private UUID offreId;
    private AffectationResponse affectation;

    // Champs spécifiques (Ordinateur)
    private String cpu;
    private String ram;
    private String disqueDur;
    private String ecran;

    // Champs spécifiques (Imprimante)
    private String vitesseImpression;
    private String resolution;
}

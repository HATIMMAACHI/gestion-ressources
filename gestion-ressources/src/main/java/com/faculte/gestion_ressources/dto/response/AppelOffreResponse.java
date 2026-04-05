package com.faculte.gestion_ressources.dto.response;

import com.faculte.gestion_ressources.enums.StatutAppelOffre;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class AppelOffreResponse {
    private UUID id;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private StatutAppelOffre statut;
    private UUID responsableId;
    
    // Detailed specific fields for response
    private List<BesoinResponse> besoins;
    private List<AffectationPrevueResponse> affectationsPrevues;
    private Integer nombreOffres;
}

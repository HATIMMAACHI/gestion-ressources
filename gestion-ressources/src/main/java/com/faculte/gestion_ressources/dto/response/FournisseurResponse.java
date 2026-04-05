package com.faculte.gestion_ressources.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class FournisseurResponse {
    private UUID id;
    private UUID userId;
    private String nomSociete;
    private String adresse;
    private String siteWeb;
    private String gerant;
    private Boolean estListeNoire;
    private String motifBannissement;
}

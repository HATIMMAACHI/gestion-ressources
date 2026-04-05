package com.faculte.gestion_ressources.dto;

import lombok.Data;

@Data
public class RessourceDTO {
    private Long id;
    private String nom;
    private String description;
    private String type;
}

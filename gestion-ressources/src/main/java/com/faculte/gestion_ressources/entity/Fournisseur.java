package com.faculte.gestion_ressources.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@DiscriminatorValue("FOURNISSEUR")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Fournisseur extends User {

    private String nomSociete;

    private String adresse;
    private String siteWeb;
    private String gerant;

    @Builder.Default
    private Boolean estListeNoire = false;

    @Column(columnDefinition = "TEXT")
    private String motifBannissement;
}

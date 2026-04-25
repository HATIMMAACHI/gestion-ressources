package com.faculte.gestion_ressources.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@DiscriminatorValue("IMPRIMANTE")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class Imprimante extends Ressource {
    private String vitesseImpression;
    private String resolution;
}

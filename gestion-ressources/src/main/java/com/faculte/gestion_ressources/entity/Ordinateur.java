package com.faculte.gestion_ressources.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@DiscriminatorValue("ORDINATEUR")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class Ordinateur extends Ressource {
    private String cpu;
    private String ram;
    private String disqueDur;
    private String ecran;
}

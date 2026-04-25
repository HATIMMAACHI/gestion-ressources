package com.faculte.gestion_ressources.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@DiscriminatorValue("TECHNICIEN")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class Technicien extends User {
}

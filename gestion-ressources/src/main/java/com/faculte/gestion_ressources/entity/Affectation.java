package com.faculte.gestion_ressources.entity;

import com.faculte.gestion_ressources.enums.TypeAffectation;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "affectations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Affectation {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ressource_id", nullable = false, unique = true)
    private Ressource ressource;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departement_id", nullable = false)
    private Departement departement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id")
    private User utilisateur;

    @Column(nullable = false)
    private LocalDate dateAffectation;

    @Column(nullable = false)
    private Boolean actif;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeAffectation typeAffectation;
}

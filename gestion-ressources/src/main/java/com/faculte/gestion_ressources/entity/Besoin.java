package com.faculte.gestion_ressources.entity;

import com.faculte.gestion_ressources.enums.StatutBesoin;
import com.faculte.gestion_ressources.enums.TypeRessource;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

@Entity
@Table(name = "besoins")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Besoin {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeRessource typeRessource;

    @Column(nullable = false)
    private Integer quantite;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private String specsJson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "demandeur_id")
    private User demandeur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departement_id", nullable = false)
    private Departement departement;

    private String motif;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutBesoin statut;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appel_offre_id")
    private AppelOffre appelOffre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reunion_id")
    private Reunion reunion;
}

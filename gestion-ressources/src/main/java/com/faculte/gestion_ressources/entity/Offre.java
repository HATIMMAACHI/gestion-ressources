package com.faculte.gestion_ressources.entity;

import com.faculte.gestion_ressources.enums.StatutOffre;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "offres")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Offre {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appel_offre_id", nullable = false)
    private AppelOffre appelOffre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fournisseur_id", nullable = false)
    private Fournisseur fournisseur;

    @Column(nullable = false)
    private LocalDate dateLivraison;

    @Column(nullable = false)
    private Integer dureeGarantieMois;

    @Column(nullable = false)
    private BigDecimal prixTotal;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private String detailJson;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutOffre statut;
}

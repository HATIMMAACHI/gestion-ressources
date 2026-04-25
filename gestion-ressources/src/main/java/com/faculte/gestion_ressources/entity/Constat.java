package com.faculte.gestion_ressources.entity;

import com.faculte.gestion_ressources.enums.DecisionResponsable;
import com.faculte.gestion_ressources.enums.Frequence;
import com.faculte.gestion_ressources.enums.TypePanne;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "constats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Constat {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "panne_id", nullable = false, unique = true)
    private Panne panne;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technicien_id", nullable = false)
    private User technicien;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String explication;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Frequence frequence;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypePanne typePanne;

    @Enumerated(EnumType.STRING)
    private DecisionResponsable decisionResponsable;

    @Column(nullable = false)
    private LocalDate dateConstat;

    @Column(nullable = false)
    @Builder.Default
    private Boolean notificationEnvoyee = false;
}

package com.faculte.gestion_ressources.entity;

import com.faculte.gestion_ressources.enums.StatutPanne;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "pannes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Panne {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ressource_id", nullable = false)
    private Ressource ressource;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "signaled_by_id", nullable = false)
    private User signaledBy;

    @Column(nullable = false)
    private LocalDate dateApparition;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutPanne statut;
}

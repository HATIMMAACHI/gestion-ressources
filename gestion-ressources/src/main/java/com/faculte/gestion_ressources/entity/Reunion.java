package com.faculte.gestion_ressources.entity;

import com.faculte.gestion_ressources.enums.StatutReunion;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reunions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reunion {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departement_id", nullable = false)
    private Departement departement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chef_dept_id", nullable = false)
    private User chefDept;

    @Column(nullable = false)
    private LocalDateTime dateConvocation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutReunion statut;

    @Column(columnDefinition = "TEXT")
    private String notes;
}

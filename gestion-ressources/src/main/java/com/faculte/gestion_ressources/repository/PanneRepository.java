package com.faculte.gestion_ressources.repository;

import com.faculte.gestion_ressources.entity.Panne;
import com.faculte.gestion_ressources.enums.StatutPanne;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

import com.faculte.gestion_ressources.enums.TypeRessource;

public interface PanneRepository extends JpaRepository<Panne, UUID> {
    List<Panne> findByStatut(StatutPanne statut);
    List<Panne> findByRessourceType(TypeRessource type);
    List<Panne> findBySignaledById(UUID signaledById);
    boolean existsByRessourceIdAndStatutNot(UUID ressourceId, StatutPanne statut);
}

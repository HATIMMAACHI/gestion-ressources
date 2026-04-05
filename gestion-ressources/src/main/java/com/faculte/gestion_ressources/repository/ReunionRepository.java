package com.faculte.gestion_ressources.repository;

import com.faculte.gestion_ressources.entity.Reunion;
import com.faculte.gestion_ressources.enums.StatutReunion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ReunionRepository extends JpaRepository<Reunion, UUID> {
    List<Reunion> findByDepartementId(UUID departementId);
    List<Reunion> findByDepartementIdAndStatut(UUID departementId, StatutReunion statut);
}

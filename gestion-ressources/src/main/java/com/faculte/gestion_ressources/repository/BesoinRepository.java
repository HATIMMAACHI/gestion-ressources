package com.faculte.gestion_ressources.repository;

import com.faculte.gestion_ressources.entity.Besoin;
import com.faculte.gestion_ressources.enums.StatutBesoin;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface BesoinRepository extends JpaRepository<Besoin, UUID> {
    List<Besoin> findByDepartementId(UUID departementId);
    List<Besoin> findByStatut(StatutBesoin statut);
    List<Besoin> findByDepartementIdAndStatut(UUID departementId, StatutBesoin statut);
    List<Besoin> findByAppelOffreId(UUID appelOffreId);
}

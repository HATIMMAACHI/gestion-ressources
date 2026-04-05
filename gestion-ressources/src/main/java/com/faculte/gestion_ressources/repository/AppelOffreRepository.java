package com.faculte.gestion_ressources.repository;

import com.faculte.gestion_ressources.entity.AppelOffre;
import com.faculte.gestion_ressources.enums.StatutAppelOffre;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AppelOffreRepository extends JpaRepository<AppelOffre, UUID> {
    List<AppelOffre> findByStatut(StatutAppelOffre statut);
}

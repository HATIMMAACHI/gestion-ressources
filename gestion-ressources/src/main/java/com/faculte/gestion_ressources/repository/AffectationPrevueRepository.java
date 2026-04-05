package com.faculte.gestion_ressources.repository;

import com.faculte.gestion_ressources.entity.AffectationPrevue;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AffectationPrevueRepository extends JpaRepository<AffectationPrevue, UUID> {
    List<AffectationPrevue> findByAppelOffreId(UUID appelOffreId);
}

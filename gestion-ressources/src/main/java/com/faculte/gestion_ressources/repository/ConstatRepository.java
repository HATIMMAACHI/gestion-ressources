package com.faculte.gestion_ressources.repository;

import com.faculte.gestion_ressources.entity.Constat;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface ConstatRepository extends JpaRepository<Constat, UUID> {
    boolean existsByPanneId(UUID panneId);
    Optional<Constat> findByPanneId(UUID panneId);
}

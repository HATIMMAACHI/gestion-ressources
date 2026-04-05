package com.faculte.gestion_ressources.repository;

import com.faculte.gestion_ressources.entity.Offre;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface OffreRepository extends JpaRepository<Offre, UUID> {
    List<Offre> findByAppelOffreIdOrderByPrixTotalAsc(UUID appelOffreId);
    boolean existsByAppelOffreIdAndFournisseurId(UUID appelOffreId, UUID fournisseurId);
    List<Offre> findByAppelOffreId(UUID appelOffreId);
}

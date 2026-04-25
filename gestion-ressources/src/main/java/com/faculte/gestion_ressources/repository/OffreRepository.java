package com.faculte.gestion_ressources.repository;

import com.faculte.gestion_ressources.entity.Offre;
import com.faculte.gestion_ressources.enums.StatutOffre;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OffreRepository extends JpaRepository<Offre, UUID> {
    List<Offre> findByAppelOffreIdOrderByPrixTotalAsc(UUID appelOffreId);
    List<Offre> findByAppelOffreIdAndFournisseurIdOrderByPrixTotalAsc(UUID appelOffreId, UUID fournisseurId);
    boolean existsByAppelOffreIdAndFournisseurId(UUID appelOffreId, UUID fournisseurId);
    List<Offre> findByAppelOffreId(UUID appelOffreId);
    List<Offre> findByFournisseurIdOrderByIdDesc(UUID fournisseurId);
    Optional<Offre> findByIdAndFournisseurId(UUID id, UUID fournisseurId);

    List<Offre> findByStatutOrderByIdDesc(StatutOffre statut);
}

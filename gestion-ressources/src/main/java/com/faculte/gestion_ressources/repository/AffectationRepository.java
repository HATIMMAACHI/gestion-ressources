package com.faculte.gestion_ressources.repository;

import com.faculte.gestion_ressources.entity.Affectation;
import com.faculte.gestion_ressources.enums.TypeAffectation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AffectationRepository extends JpaRepository<Affectation, UUID> {
    List<Affectation> findByDepartementId(UUID departementId);
    List<Affectation> findByTypeAffectation(TypeAffectation typeAffectation);
    List<Affectation> findByActif(Boolean actif);
    
    @Query("SELECT a FROM Affectation a WHERE a.ressource.id = :ressourceId AND a.actif = true")
    Optional<Affectation> findActiveByRessourceId(@Param("ressourceId") UUID ressourceId);
}

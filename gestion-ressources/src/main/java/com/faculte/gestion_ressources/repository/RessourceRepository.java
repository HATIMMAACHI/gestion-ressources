package com.faculte.gestion_ressources.repository;

import com.faculte.gestion_ressources.entity.Ressource;
import com.faculte.gestion_ressources.enums.EtatRessource;
import com.faculte.gestion_ressources.enums.TypeRessource;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface RessourceRepository extends JpaRepository<Ressource, UUID> {
    List<Ressource> findByType(TypeRessource type);
    List<Ressource> findByEtat(EtatRessource etat);
    List<Ressource> findByFournisseurId(UUID fournisseurId);
}

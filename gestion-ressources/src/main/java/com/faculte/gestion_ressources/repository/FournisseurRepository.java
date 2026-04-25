package com.faculte.gestion_ressources.repository;

import com.faculte.gestion_ressources.entity.Fournisseur;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FournisseurRepository extends JpaRepository<Fournisseur, UUID> {
    List<Fournisseur> findByEstListeNoire(Boolean estListeNoire);
}

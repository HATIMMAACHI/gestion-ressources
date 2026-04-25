package com.faculte.gestion_ressources.repository;

import com.faculte.gestion_ressources.entity.Enseignant;
import com.faculte.gestion_ressources.entity.ChefDepartement;
import com.faculte.gestion_ressources.entity.Fournisseur;
import com.faculte.gestion_ressources.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    @Query("SELECT e FROM Enseignant e WHERE e.id = :id")
    Optional<Enseignant> findEnseignantById(UUID id);

    @Query("SELECT c FROM ChefDepartement c WHERE c.id = :id")
    Optional<ChefDepartement> findChefById(UUID id);

    @Query("SELECT f FROM Fournisseur f WHERE f.id = :id")
    Optional<Fournisseur> findFournisseurById(UUID id);
}

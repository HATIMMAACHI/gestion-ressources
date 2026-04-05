package com.faculte.gestion_ressources.repository;

import com.faculte.gestion_ressources.entity.Departement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface DepartementRepository extends JpaRepository<Departement, UUID> {
}

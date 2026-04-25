package com.faculte.gestion_ressources.config;

import com.faculte.gestion_ressources.entity.*;
import com.faculte.gestion_ressources.enums.Role;
import com.faculte.gestion_ressources.repository.DepartementRepository;
import com.faculte.gestion_ressources.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.function.Supplier;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartementRepository departementRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("Initialisation/actualisation des données de test...");

        Departement deptInfo = departementRepository.findAll().stream()
            .filter(dept -> "Informatique".equals(dept.getNom()))
            .findFirst()
            .orElseGet(() -> departementRepository.save(Departement.builder().nom("Informatique").build()));

        Departement deptMath = departementRepository.findAll().stream()
            .filter(dept -> "Mathématiques".equals(dept.getNom()))
            .findFirst()
            .orElseGet(() -> departementRepository.save(Departement.builder().nom("Mathématiques").build()));

        upsertUser("Chef Info", "chef@info.faculte.ma", "password", Role.CHEF_DEPT, () -> ChefDepartement.builder().departement(deptInfo));
        upsertUser("Enseignant Info", "enseignant@info.faculte.ma", "password", Role.ENSEIGNANT, () -> Enseignant.builder().departement(deptInfo));
        upsertUser("Responsable Achats", "responsable@faculte.ma", "password", Role.RESPONSABLE, ResponsableRessources::builder);
        upsertUser("Technicien Maintenance", "technicien@faculte.ma", "password", Role.TECHNICIEN, Technicien::builder);
        upsertUser("Fournisseur Test", "contact@fournisseur.com", "password", Role.FOURNISSEUR, () -> Fournisseur.builder().nomSociete("Fournisseur Test").estListeNoire(false));

        log.info("Données de test synchronisées avec succès.");
    }

        private void upsertUser(String nom, String email, String password, Role role, Supplier<? extends User.UserBuilder<?, ?>> builderSupplier) {
        String encodedPassword = passwordEncoder.encode(password);

        User user = userRepository.findByEmail(email).orElseGet(() -> switch (role) {
            case CHEF_DEPT -> (User) builderSupplier.get()
                .nom(nom).email(email).passwordHash(encodedPassword).role(Role.CHEF_DEPT).build();
            case ENSEIGNANT -> (User) builderSupplier.get()
                .nom(nom).email(email).passwordHash(encodedPassword).role(Role.ENSEIGNANT).build();
            case RESPONSABLE -> (User) builderSupplier.get()
                .nom(nom).email(email).passwordHash(encodedPassword).role(Role.RESPONSABLE).build();
            case TECHNICIEN -> (User) builderSupplier.get()
                .nom(nom).email(email).passwordHash(encodedPassword).role(Role.TECHNICIEN).build();
            case FOURNISSEUR -> (User) builderSupplier.get()
                .nom(nom).email(email).passwordHash(encodedPassword).role(Role.FOURNISSEUR).build();
            default -> throw new IllegalArgumentException("Rôle non supporté");
        });

        user.setNom(nom);
        user.setEmail(email);
        user.setPasswordHash(encodedPassword);
        user.setRole(role);

        if (user instanceof ChefDepartement chef && role == Role.CHEF_DEPT) {
            chef.setDepartement(departementRepository.findAll().stream()
                .filter(dept -> "Informatique".equals(dept.getNom()))
                .findFirst()
                .orElse(null));
        } else if (user instanceof Enseignant enseignant && role == Role.ENSEIGNANT) {
            enseignant.setDepartement(departementRepository.findAll().stream()
                .filter(dept -> "Informatique".equals(dept.getNom()))
                .findFirst()
                .orElse(null));
        } else if (user instanceof Fournisseur fournisseur && role == Role.FOURNISSEUR) {
            fournisseur.setNomSociete(nom);
            fournisseur.setEstListeNoire(Boolean.FALSE);
        }

        userRepository.save(user);
    }
}

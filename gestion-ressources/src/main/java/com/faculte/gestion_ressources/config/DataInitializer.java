package com.faculte.gestion_ressources.config;

import com.faculte.gestion_ressources.entity.Departement;
import com.faculte.gestion_ressources.entity.User;
import com.faculte.gestion_ressources.enums.Role;
import com.faculte.gestion_ressources.repository.DepartementRepository;
import com.faculte.gestion_ressources.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartementRepository departementRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Données déjà initialisées.");
            return;
        }

        log.info("Initialisation des données de test...");

        Departement deptInfo = Departement.builder().nom("Informatique").build();
        Departement deptMath = Departement.builder().nom("Mathématiques").build();
        departementRepository.save(deptInfo);
        departementRepository.save(deptMath);

        createUser("Chef Info", "chef@info.faculte.ma", "password", Role.CHEF_DEPT, deptInfo);
        createUser("Enseignant Info", "enseignant@info.faculte.ma", "password", Role.ENSEIGNANT, deptInfo);
        createUser("Responsable Achats", "responsable@faculte.ma", "password", Role.RESPONSABLE, null);
        createUser("Technicien Maintenance", "technicien@faculte.ma", "password", Role.TECHNICIEN, null);
        createUser("Fournisseur Test", "contact@fournisseur.com", "password", Role.FOURNISSEUR, null);

        log.info("Initialisation terminée avec succès.");
    }

    private void createUser(String nom, String email, String password, Role role, Departement dept) {
        User user = User.builder()
                .nom(nom)
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .role(role)
                .departement(dept)
                .build();
        userRepository.save(user);
    }
}

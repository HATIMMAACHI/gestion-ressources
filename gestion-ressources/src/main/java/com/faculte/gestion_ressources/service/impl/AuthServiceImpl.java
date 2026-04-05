package com.faculte.gestion_ressources.service.impl;

import com.faculte.gestion_ressources.dto.request.LoginRequest;
import com.faculte.gestion_ressources.dto.request.RegisterFournisseurRequest;
import com.faculte.gestion_ressources.dto.response.LoginResponse;
import com.faculte.gestion_ressources.dto.response.UserResponse;
import com.faculte.gestion_ressources.entity.Fournisseur;
import com.faculte.gestion_ressources.entity.User;
import com.faculte.gestion_ressources.enums.Role;
import com.faculte.gestion_ressources.exception.AppException;
import com.faculte.gestion_ressources.mapper.UserMapper;
import com.faculte.gestion_ressources.repository.FournisseurRepository;
import com.faculte.gestion_ressources.repository.UserRepository;
import com.faculte.gestion_ressources.security.JwtService;
import com.faculte.gestion_ressources.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final FournisseurRepository fournisseurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final UserMapper userMapper;

    @Value("${application.security.jwt.expiration}")
    private long jwtExpiration;

    @Override
    public LoginResponse authenticate(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (AuthenticationException e) {
            throw new AppException(HttpStatus.FORBIDDEN, "Email ou mot de passe incorrect");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String jwtToken = jwtService.generateToken(userDetails);

        return LoginResponse.builder()
                .token(jwtToken)
                .expiresIn(jwtExpiration)
                .user(userMapper.toResponse(user))
                .build();
    }

    @Override
    @Transactional
    public UserResponse registerFournisseur(RegisterFournisseurRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new AppException(HttpStatus.CONFLICT, "L'email est déjà utilisé");
        }

        User user = User.builder()
                .nom(request.getNomSociete())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.FOURNISSEUR)
                .build();
        userRepository.save(user);

        Fournisseur fournisseur = Fournisseur.builder()
                .nomSociete(request.getNomSociete())
                .user(user)
                .estListeNoire(false)
                .build();
        fournisseurRepository.save(fournisseur);

        return userMapper.toResponse(user);
    }
}

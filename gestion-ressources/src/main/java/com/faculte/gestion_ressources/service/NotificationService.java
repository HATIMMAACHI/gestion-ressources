package com.faculte.gestion_ressources.service;

import com.faculte.gestion_ressources.enums.NotificationType;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    private final ObjectMapper objectMapper;

    public void send(UUID userId, NotificationType type, Object payload) {
        try {
            log.info("[NOTIFICATION] to={} type={} payload={}",
                    userId, type, objectMapper.writeValueAsString(payload));
            // Prêt pour intégration email/push en prod
        } catch (Exception e) {
            log.error("Failed to serialize notification payload for user: {}", userId, e);
        }
    }
}

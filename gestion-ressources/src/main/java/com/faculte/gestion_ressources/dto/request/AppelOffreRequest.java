package com.faculte.gestion_ressources.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class AppelOffreRequest {
    @NotEmpty(message = "La liste des besoins ne peut pas être vide")
    private List<UUID> besoinIds;

    @NotNull(message = "La date de fin est requise")
    @Future(message = "La date de fin doit être dans le futur")
    private LocalDate dateFin;
}

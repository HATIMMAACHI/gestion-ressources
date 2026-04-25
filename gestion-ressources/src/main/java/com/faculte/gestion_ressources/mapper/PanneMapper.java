package com.faculte.gestion_ressources.mapper;

import com.faculte.gestion_ressources.dto.response.PanneResponse;
import com.faculte.gestion_ressources.entity.Panne;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PanneMapper {

    @Mapping(target = "ressourceId", source = "ressource.id")
    @Mapping(target = "ressourceCode", source = "ressource.codeInventaire")
    @Mapping(target = "dateLivraison", source = "ressource.dateLivraison")
    @Mapping(target = "dureeGarantie", source = "ressource.dureeGarantie")
    @Mapping(target = "estSousGarantie", expression = "java(panne.getRessource().getDateLivraison().plusMonths(panne.getRessource().getDureeGarantie()).isAfter(java.time.LocalDate.now()))")
    @Mapping(target = "signaledById", source = "signaledBy.id")
    @Mapping(target = "signaledByNom", source = "signaledBy.nom")
    @Mapping(target = "constat", ignore = true)
    PanneResponse toResponse(Panne panne);
}

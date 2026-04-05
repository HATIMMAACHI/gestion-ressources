package com.faculte.gestion_ressources.mapper;

import com.faculte.gestion_ressources.dto.response.AffectationResponse;
import com.faculte.gestion_ressources.entity.Affectation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AffectationMapper {

    @Mapping(target = "ressourceId", source = "ressource.id")
    @Mapping(target = "departementId", source = "departement.id")
    @Mapping(target = "utilisateurId", source = "utilisateur.id")
    @Mapping(target = "affecteA", ignore = true)
    AffectationResponse toResponse(Affectation entity);
}

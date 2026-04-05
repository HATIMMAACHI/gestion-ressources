package com.faculte.gestion_ressources.mapper;

import com.faculte.gestion_ressources.dto.response.RessourceResponse;
import com.faculte.gestion_ressources.entity.Ressource;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RessourceMapper {

    @Mapping(target = "fournisseurId", source = "fournisseur.id")
    @Mapping(target = "offreId", source = "offre.id")
    @Mapping(target = "affectation", ignore = true)
    RessourceResponse toResponse(Ressource entity);
}

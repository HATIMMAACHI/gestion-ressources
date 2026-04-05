package com.faculte.gestion_ressources.mapper;

import com.faculte.gestion_ressources.dto.response.OffreResponse;
import com.faculte.gestion_ressources.entity.Offre;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OffreMapper {

    @Mapping(target = "appelOffreId", source = "appelOffre.id")
    @Mapping(target = "fournisseurId", source = "fournisseur.id")
    OffreResponse toResponse(Offre entity);
}

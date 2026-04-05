package com.faculte.gestion_ressources.mapper;

import com.faculte.gestion_ressources.dto.response.BesoinResponse;
import com.faculte.gestion_ressources.entity.Besoin;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BesoinMapper {

    @Mapping(target = "demandeurId", source = "demandeur.id")
    @Mapping(target = "departementId", source = "departement.id")
    @Mapping(target = "appelOffreId", source = "appelOffre.id")
    @Mapping(target = "reunionId", source = "reunion.id")
    BesoinResponse toResponse(Besoin entity);
}

package com.faculte.gestion_ressources.mapper;

import com.faculte.gestion_ressources.dto.response.PanneResponse;
import com.faculte.gestion_ressources.entity.Panne;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PanneMapper {

    @Mapping(target = "ressourceId", source = "ressource.id")
    @Mapping(target = "signaledById", source = "signaledBy.id")
    @Mapping(target = "constat", ignore = true)
    PanneResponse toResponse(Panne entity);
}

package com.faculte.gestion_ressources.mapper;

import com.faculte.gestion_ressources.dto.response.ConstatResponse;
import com.faculte.gestion_ressources.entity.Constat;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ConstatMapper {

    @Mapping(target = "panneId", source = "panne.id")
    @Mapping(target = "technicienId", source = "technicien.id")
    ConstatResponse toResponse(Constat entity);
}

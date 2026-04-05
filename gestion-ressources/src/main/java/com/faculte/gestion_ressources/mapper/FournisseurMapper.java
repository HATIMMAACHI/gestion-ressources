package com.faculte.gestion_ressources.mapper;

import com.faculte.gestion_ressources.dto.response.FournisseurResponse;
import com.faculte.gestion_ressources.entity.Fournisseur;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FournisseurMapper {

    @Mapping(target = "userId", source = "user.id")
    FournisseurResponse toResponse(Fournisseur entity);
}

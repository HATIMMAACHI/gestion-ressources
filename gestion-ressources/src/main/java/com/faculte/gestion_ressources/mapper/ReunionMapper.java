package com.faculte.gestion_ressources.mapper;

import com.faculte.gestion_ressources.dto.response.ReunionResponse;
import com.faculte.gestion_ressources.entity.Reunion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReunionMapper {

    @Mapping(target = "departementId", source = "departement.id")
    @Mapping(target = "chefDeptId", source = "chefDept.id")
    ReunionResponse toResponse(Reunion entity);
}

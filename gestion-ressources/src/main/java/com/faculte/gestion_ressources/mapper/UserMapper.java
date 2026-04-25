package com.faculte.gestion_ressources.mapper;

import com.faculte.gestion_ressources.dto.response.UserResponse;
import com.faculte.gestion_ressources.entity.User;
import com.faculte.gestion_ressources.entity.ChefDepartement;
import com.faculte.gestion_ressources.entity.Enseignant;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "departementId", ignore = true)
    UserResponse toResponse(User entity);

    @AfterMapping
    default void handleSubclasses(User entity, @MappingTarget UserResponse response) {
        if (entity instanceof Enseignant e && e.getDepartement() != null) {
            response.setDepartementId(e.getDepartement().getId());
        } else if (entity instanceof ChefDepartement c && c.getDepartement() != null) {
            response.setDepartementId(c.getDepartement().getId());
        }
    }
}

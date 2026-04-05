package com.faculte.gestion_ressources.mapper;

import com.faculte.gestion_ressources.dto.response.UserResponse;
import com.faculte.gestion_ressources.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "departementId", source = "departement.id")
    UserResponse toResponse(User entity);
}

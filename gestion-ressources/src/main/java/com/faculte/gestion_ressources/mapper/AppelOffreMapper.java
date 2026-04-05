package com.faculte.gestion_ressources.mapper;

import com.faculte.gestion_ressources.dto.response.AppelOffreResponse;
import com.faculte.gestion_ressources.dto.response.AffectationPrevueResponse;
import com.faculte.gestion_ressources.entity.AppelOffre;
import com.faculte.gestion_ressources.entity.AffectationPrevue;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AppelOffreMapper {

    @Mapping(target = "responsableId", source = "responsable.id")
    @Mapping(target = "besoins", ignore = true)
    @Mapping(target = "affectationsPrevues", ignore = true)
    @Mapping(target = "nombreOffres", ignore = true)
    AppelOffreResponse toResponse(AppelOffre entity);

    @Mapping(target = "appelOffreId", source = "appelOffre.id")
    @Mapping(target = "besoinId", source = "besoin.id")
    @Mapping(target = "utilisateurId", source = "utilisateur.id")
    @Mapping(target = "departementId", source = "departement.id")
    AffectationPrevueResponse toAffectationPrevueResponse(AffectationPrevue entity);
}

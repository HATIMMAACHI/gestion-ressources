package com.faculte.gestion_ressources.mapper;

import com.faculte.gestion_ressources.dto.response.RessourceResponse;
import com.faculte.gestion_ressources.entity.Ressource;
import com.faculte.gestion_ressources.entity.Imprimante;
import com.faculte.gestion_ressources.entity.Ordinateur;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface RessourceMapper {

    @Mapping(target = "fournisseurId", source = "fournisseur.id")
    @Mapping(target = "offreId", source = "offre.id")
    @Mapping(target = "affectation", ignore = true)
    @Mapping(target = "cpu", ignore = true)
    @Mapping(target = "ram", ignore = true)
    @Mapping(target = "disqueDur", ignore = true)
    @Mapping(target = "ecran", ignore = true)
    @Mapping(target = "vitesseImpression", ignore = true)
    @Mapping(target = "resolution", ignore = true)
    RessourceResponse toResponse(Ressource entity);

    @AfterMapping
    default void handleSubclasses(Ressource entity, @MappingTarget RessourceResponse response) {
        if (entity instanceof Ordinateur o) {
            response.setCpu(o.getCpu());
            response.setRam(o.getRam());
            response.setDisqueDur(o.getDisqueDur());
            response.setEcran(o.getEcran());
        } else if (entity instanceof Imprimante i) {
            response.setVitesseImpression(i.getVitesseImpression());
            response.setResolution(i.getResolution());
        }
    }
}

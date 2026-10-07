package com.mg.Inmobiliaria.service;

import com.mg.Inmobiliaria.model.FotoPropiedad;
import com.mg.Inmobiliaria.model.Propiedad;
import com.mg.Inmobiliaria.repository.FotoPropiedadRepository;
import com.mg.Inmobiliaria.repository.PropiedadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Servicio encargado de la lógica de negocio para las fotografías de los inmuebles.
 */
@Service
public class FotoPropiedadService {

    @Autowired
    private FotoPropiedadRepository fotoPropiedadRepository;

    @Autowired
    private PropiedadRepository propiedadRepository;

    /**
     * Obtiene la lista de fotos asociadas a una propiedad.
     */
    public List<FotoPropiedad> obtenerPorPropiedad(Long propiedadId) {
        return fotoPropiedadRepository.findByPropiedadId(propiedadId);
    }

    /**
     * Asocia una nueva foto (por URL) a una propiedad existente.
     */
    public Optional<FotoPropiedad> agregarFoto(Long propiedadId, String urlFoto, Boolean esPrincipal) {
        Optional<Propiedad> propiedadOpt = propiedadRepository.findById(propiedadId);
        
        if (propiedadOpt.isPresent()) {
            Propiedad propiedad = propiedadOpt.get();
            
            FotoPropiedad nuevaFoto = FotoPropiedad.builder()
                    .propiedad(propiedad)
                    .urlFoto(urlFoto)
                    .esPrincipal(esPrincipal != null ? esPrincipal : false)
                    .build();

            return Optional.of(fotoPropiedadRepository.save(nuevaFoto));
        }
        
        return Optional.empty();
    }

    /**
     * Elimina una foto por su ID.
     */
    public void eliminarFoto(Long fotoId) {
        fotoPropiedadRepository.deleteById(fotoId);
    }
}
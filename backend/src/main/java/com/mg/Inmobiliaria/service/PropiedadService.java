package com.mg.Inmobiliaria.service;

import com.mg.Inmobiliaria.model.EstadoPropiedad;
import com.mg.Inmobiliaria.model.Propiedad;
import com.mg.Inmobiliaria.model.TipoOperacion;
import com.mg.Inmobiliaria.model.TipoPropiedad;
import com.mg.Inmobiliaria.repository.PropiedadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class PropiedadService {

    @Autowired
    private PropiedadRepository propiedadRepository;

    // Inyección del servicio de almacenamiento físico en disco
    @Autowired
    private FileStorageService fileStorageService;

    // Inyección de tu servicio de BD para las fotografías
    @Autowired
    private FotoPropiedadService fotoPropiedadService;

    public List<Propiedad> listarTodas() {
        return propiedadRepository.findAll();
    }

    public Optional<Propiedad> obtenerPorId(Long id) {
        return propiedadRepository.findById(id);
    }

    public List<Propiedad> buscarDestacadas() {
        return propiedadRepository.findByDestacadaTrueAndEstado(EstadoPropiedad.DISPONIBLE);
    }

    public List<Propiedad> buscarConFiltros(
            String ciudad,
            TipoOperacion tipoOperacion,
            TipoPropiedad tipoPropiedad,
            BigDecimal precioMin,
            BigDecimal precioMax,
            Integer ambientes,
            Integer dormitorios,
            EstadoPropiedad estado
    ) {
        return propiedadRepository.buscarAvanzado(
                ciudad, tipoOperacion, tipoPropiedad, precioMin, precioMax, ambientes, dormitorios, estado
        );
    }

    public Propiedad guardar(Propiedad propiedad) {
        return propiedadRepository.save(propiedad);
    }

    /**
     * Guarda o edita una propiedad registrando sus imágenes en disco local y en la BD.
     * La anotación @Transactional asegura que si falla la escritura, se desagan los cambios en MySQL.
     * 
     * @param propiedad Entidad deserializada enviada desde el frontend
     * @param archivosImagenes Lista de imágenes (MultipartFile) opcional
     * @return Propiedad guardada y sincronizada con sus fotos
     */
    @Transactional
    public Propiedad guardarPropiedadConFotos(Propiedad propiedad, List<MultipartFile> archivosImagenes) {
        // 1. Persistir o actualizar la entidad base para asegurar su ID de MySQL
        Propiedad propiedadGuardada = propiedadRepository.save(propiedad);

        // 2. Si vienen archivos binarios, procesar la escritura en disco y registro en la BD
        if (archivosImagenes != null && !archivosImagenes.isEmpty()) {
            // Guardar archivos físicos en C:\xampp\img\propiedades\{id}
            List<String> rutasRelativas = fileStorageService.guardarImagenes(propiedadGuardada.getId(), archivosImagenes);

            // Determinar si la propiedad ya tiene fotos principales para no sobreescribir esa marca
            boolean esPrimera = fotoPropiedadService.obtenerPorPropiedad(propiedadGuardada.getId()).isEmpty();

            // Vincular las rutas resultantes a la base de datos a través de FotoPropiedadService
            for (String url : rutasRelativas) {
                fotoPropiedadService.agregarFoto(propiedadGuardada.getId(), url, esPrimera);
                esPrimera = false; // Solo la primera foto agregada se asigna como principal
            }
        }

        // 3. Devolver la entidad con sus relaciones cargadas
        return propiedadRepository.findById(propiedadGuardada.getId()).orElse(propiedadGuardada);
    }

    public void eliminar(Long id) {
        propiedadRepository.deleteById(id);
    }
}
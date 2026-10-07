package com.mg.Inmobiliaria.controller;

import com.mg.Inmobiliaria.model.*;
import com.mg.Inmobiliaria.repository.UsuarioRepository;
import com.mg.Inmobiliaria.service.PropiedadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

/**
 * Controlador REST para la gestión integral de Propiedades en la plataforma Inmobiliaria.
 * Procesa peticiones HTTP, maneja filtros y delega el almacenamiento de archivos y 
 * persistencia de datos a la capa de servicios.
 */
@RestController
@RequestMapping("/api/propiedades")
public class PropiedadController {

    @Autowired
    private PropiedadService propiedadService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * Evita errores de conversión como MethodArgumentNotValidException o TypeMismatchException
     * impidiendo que Spring DataBinder intente convertir cadenas complejas o textos "[object Object]"
     * directamente en el atributo de entidad 'agente'. La asignación del agente se realiza de forma autónoma por ID.
     */
    @InitBinder
    public void initBinder(WebDataBinder binder) {
        binder.setDisallowedFields("agente");
    }

    /**
     * Helper interno para resolver el agente asignado a partir del ID provisto en cualquiera
     * de los parámetros soportados (agenteId numérico o agenteRaw string).
     */
    private Usuario resolverAgente(Long agenteId, String agenteRaw) {
        Long idBuscado = agenteId;

        if (idBuscado == null && agenteRaw != null && !agenteRaw.trim().isEmpty()) {
            try {
                idBuscado = Long.parseLong(agenteRaw.trim());
            } catch (NumberFormatException ignored) {
                // Ignorar cadenas no numéricas como "[object Object]"
            }
        }

        if (idBuscado != null) {
            return usuarioRepository.findById(idBuscado).orElse(null);
        }
        return null;
    }

    /**
     * Obtiene el listado completo de propiedades publicadas.
     */
    @GetMapping
    public ResponseEntity<List<Propiedad>> listarTodas() {
        List<Propiedad> lista = propiedadService.listarTodas();
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noCache().mustRevalidate())
                .body(lista);
    }

    /**
     * Obtiene una propiedad específica mediante su ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Propiedad> obtenerPorId(@PathVariable Long id) {
        return propiedadService.obtenerPorId(id)
                .map(propiedad -> ResponseEntity.ok()
                        .cacheControl(CacheControl.noCache().mustRevalidate())
                        .body(propiedad))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Obtiene la lista de propiedades marcadas como destacadas.
     */
    @GetMapping("/destacadas")
    public ResponseEntity<List<Propiedad>> obtenerDestacadas() {
        List<Propiedad> destacadas = propiedadService.buscarDestacadas();
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noCache().mustRevalidate())
        .body(destacadas);
    }

    /**
     * Realiza búsquedas avanzadas utilizando filtros opcionales.
     */
    @GetMapping("/buscar")
    public ResponseEntity<List<Propiedad>> buscar(
            @RequestParam(required = false) String ciudad,
            @RequestParam(required = false) TipoOperacion tipoOperacion,
            @RequestParam(required = false) TipoPropiedad tipoPropiedad,
            @RequestParam(required = false) BigDecimal precioMin,
            @RequestParam(required = false) BigDecimal precioMax,
            @RequestParam(required = false) Integer ambientes,
            @RequestParam(required = false) Integer dormitorios,
            @RequestParam(required = false) EstadoPropiedad estado
    ) {
        List<Propiedad> resultados = propiedadService.buscarConFiltros(
                ciudad, tipoOperacion, tipoPropiedad, precioMin, precioMax, ambientes, dormitorios, estado
        );
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noCache().mustRevalidate())
                .body(resultados);
    }

    /**
     * Registra una nueva propiedad procesando la lista de imágenes recibidas y asociando el agente responsable.
     * Recibe los archivos bajo los parámetros 'files' o 'imagenes' para máxima compatibilidad multipart.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Propiedad> crear(
            @ModelAttribute Propiedad propiedad,
            @RequestParam(value = "agenteId", required = false) Long agenteId,
            @RequestParam(value = "agente", required = false) String agenteRaw,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            @RequestParam(value = "imagenes", required = false) List<MultipartFile> imagenes
    ) {
        try {
            // Unificar los archivos de imágenes provistos desde el frontend evitando duplicados
            List<MultipartFile> archivosFinales = new java.util.ArrayList<>();
            if (imagenes != null && !imagenes.isEmpty()) {
                archivosFinales.addAll(imagenes);
            } else if (files != null && !files.isEmpty()) {
                archivosFinales.addAll(files);
            }

            // Asignar el agente resuelto por ID de forma segura
            Usuario agente = resolverAgente(agenteId, agenteRaw);
            if (agente != null) {
                propiedad.setAgente(agente);
            }

            // Delegar guardado en BD y almacenamiento físico al servicio transaccional
            Propiedad nuevaPropiedad = propiedadService.guardarPropiedadConFotos(propiedad, archivosFinales);
            return ResponseEntity.ok(nuevaPropiedad);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Actualiza los datos de una propiedad existente, agregando nuevas fotos si fueron adjuntadas y preservando las anteriores.
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Propiedad> actualizar(
            @PathVariable Long id,
            @ModelAttribute Propiedad propiedadDetalles,
            @RequestParam(value = "agenteId", required = false) Long agenteId,
            @RequestParam(value = "agente", required = false) String agenteRaw,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            @RequestParam(value = "imagenes", required = false) List<MultipartFile> imagenes
    ) {
        return propiedadService.obtenerPorId(id)
                .map(propiedadExistente -> {
                    // Actualización de campos de la propiedad
                    propiedadExistente.setTitulo(propiedadDetalles.getTitulo());
                    propiedadExistente.setDescripcion(propiedadDetalles.getDescripcion());
                    propiedadExistente.setTipoPropiedad(propiedadDetalles.getTipoPropiedad());
                    propiedadExistente.setTipoOperacion(propiedadDetalles.getTipoOperacion());
                    propiedadExistente.setPrecio(propiedadDetalles.getPrecio());
                    propiedadExistente.setMoneda(propiedadDetalles.getMoneda());
                    propiedadExistente.setDireccion(propiedadDetalles.getDireccion());
                    propiedadExistente.setCiudad(propiedadDetalles.getCiudad());
                    propiedadExistente.setProvincia(propiedadDetalles.getProvincia());
                    propiedadExistente.setAmbientes(propiedadDetalles.getAmbientes());
                    propiedadExistente.setDormitorios(propiedadDetalles.getDormitorios());
                    propiedadExistente.setBanos(propiedadDetalles.getBanos());
                    propiedadExistente.setSuperficieTotal(propiedadDetalles.getSuperficieTotal());
                    propiedadExistente.setSuperficieCubierta(propiedadDetalles.getSuperficieCubierta());
                    propiedadExistente.setCochera(propiedadDetalles.getCochera());
                    propiedadExistente.setPatio(propiedadDetalles.getPatio());
                    propiedadExistente.setEstado(propiedadDetalles.getEstado());
                    propiedadExistente.setDestacada(propiedadDetalles.getDestacada());

                    // Preservar o actualizar el agente asignado
                    Usuario agente = resolverAgente(agenteId, agenteRaw);
                    if (agente != null) {
                        propiedadExistente.setAgente(agente);
                    }

                    // Unificar la lista de imágenes recibidas evitando duplicaciones
                    List<MultipartFile> archivosFinales = new java.util.ArrayList<>();
                    if (imagenes != null && !imagenes.isEmpty()) {
                        archivosFinales.addAll(imagenes);
                    } else if (files != null && !files.isEmpty()) {
                        archivosFinales.addAll(files);
                    }

                    // Delegar la actualización y el almacenamiento transaccional al servicio
                    Propiedad actualizada = propiedadService.guardarPropiedadConFotos(propiedadExistente, archivosFinales);
                    return ResponseEntity.ok(actualizada);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Elimina una propiedad por su ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        propiedadService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
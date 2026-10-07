package com.mg.Inmobiliaria.controller;

import com.mg.Inmobiliaria.model.FotoPropiedad;
import com.mg.Inmobiliaria.service.FotoPropiedadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controlador REST para la gestión de fotos de propiedades.
 */
@RestController
@RequestMapping("/api/fotos")
public class FotoPropiedadController {

    @Autowired
    private FotoPropiedadService fotoPropiedadService;

    /**
     * GET /api/fotos/propiedad/{propiedadId}
     * Obtener todas las fotos de una propiedad específica.
     */
    @GetMapping("/propiedad/{propiedadId}")
    public List<FotoPropiedad> listarPorPropiedad(@PathVariable Long propiedadId) {
        return fotoPropiedadService.obtenerPorPropiedad(propiedadId);
    }

    /**
     * POST /api/fotos/propiedad/{propiedadId}
     * Agregar una URL de foto a una propiedad.
     */
    @PostMapping("/propiedad/{propiedadId}")
    public ResponseEntity<FotoPropiedad> agregarFoto(
            @PathVariable Long propiedadId,
            @RequestBody Map<String, Object> payload
    ) {
        String urlFoto = (String) payload.get("urlFoto");
        Boolean esPrincipal = (Boolean) payload.getOrDefault("esPrincipal", false);

        if (urlFoto == null || urlFoto.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        return fotoPropiedadService.agregarFoto(propiedadId, urlFoto, esPrincipal)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * DELETE /api/fotos/{id}
     * Eliminar una foto.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarFoto(@PathVariable Long id) {
        fotoPropiedadService.eliminarFoto(id);
        return ResponseEntity.noContent().build();
    }
}
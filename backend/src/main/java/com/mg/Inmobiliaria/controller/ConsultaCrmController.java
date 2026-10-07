package com.mg.Inmobiliaria.controller;

import com.mg.Inmobiliaria.dto.ConsultaCrmDTO;
import com.mg.Inmobiliaria.model.ConsultaCrm.EstadoConsulta;
import com.mg.Inmobiliaria.service.ConsultaCrmService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para gestionar la recepción y estado de consultas CRM.
 */
@RestController
@RequestMapping("/api/consultas")
@RequiredArgsConstructor
public class ConsultaCrmController {

    private final ConsultaCrmService consultaCrmService;

    @GetMapping
    public ResponseEntity<List<ConsultaCrmDTO>> obtenerTodas() {
        return ResponseEntity.ok(consultaCrmService.obtenerTodas());
    }

    @GetMapping("/agente/{agenteId}")
    public ResponseEntity<List<ConsultaCrmDTO>> obtenerPorAgente(@PathVariable Long agenteId) {
        return ResponseEntity.ok(consultaCrmService.obtenerPorAgente(agenteId));
    }

    @GetMapping("/propiedad/{propiedadId}")
    public ResponseEntity<List<ConsultaCrmDTO>> obtenerPorPropiedad(@PathVariable Long propiedadId) {
        return ResponseEntity.ok(consultaCrmService.obtenerPorPropiedad(propiedadId));
    }

    @PostMapping
    public ResponseEntity<ConsultaCrmDTO> crearConsulta(@RequestBody ConsultaCrmDTO dto) {
        ConsultaCrmDTO creada = consultaCrmService.crearConsulta(dto);
        return new ResponseEntity<>(creada, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<ConsultaCrmDTO> cambiarEstado(
            @PathVariable Long id,
            @RequestParam EstadoConsulta estado) {
        return ResponseEntity.ok(consultaCrmService.cambiarEstado(id, estado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        consultaCrmService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
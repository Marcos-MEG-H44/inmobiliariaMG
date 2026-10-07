package com.mg.Inmobiliaria.controller;

import com.mg.Inmobiliaria.dto.ContratoDTO;
import com.mg.Inmobiliaria.service.ContratoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para la gestión y alta de contratos de alquiler.
 */
@RestController
@RequestMapping("/api/contratos")
@RequiredArgsConstructor
public class ContratoController {

    private final ContratoService contratoService;

    @GetMapping
    public ResponseEntity<List<ContratoDTO>> obtenerTodos() {
        return ResponseEntity.ok(contratoService.obtenerTodos());
    }

    @GetMapping("/inquilino/{inquilinoId}")
    public ResponseEntity<List<ContratoDTO>> obtenerPorInquilino(@PathVariable Long inquilinoId) {
        return ResponseEntity.ok(contratoService.obtenerPorInquilino(inquilinoId));
    }

    @PostMapping
    public ResponseEntity<ContratoDTO> crearContrato(@RequestBody ContratoDTO dto) {
        ContratoDTO creado = contratoService.crearContrato(dto);
        return new ResponseEntity<>(creado, HttpStatus.CREATED);
    }
}
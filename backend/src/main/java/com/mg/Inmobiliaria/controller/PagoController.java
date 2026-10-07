package com.mg.Inmobiliaria.controller;

import com.mg.Inmobiliaria.dto.PagoDTO;
import com.mg.Inmobiliaria.service.PagoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para la administración y consulta de liquidaciones/pagos.
 */
@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
public class PagoController {

    private final PagoService pagoService;

    @GetMapping
    public ResponseEntity<List<PagoDTO>> obtenerTodos() {
        return ResponseEntity.ok(pagoService.obtenerTodos());
    }

    @GetMapping("/contrato/{contratoId}")
    public ResponseEntity<List<PagoDTO>> obtenerPorContrato(@PathVariable Long contratoId) {
        return ResponseEntity.ok(pagoService.obtenerPorContrato(contratoId));
    }

    @PostMapping
    public ResponseEntity<PagoDTO> registrarPago(@RequestBody PagoDTO dto) {
        PagoDTO registrado = pagoService.registrarPago(dto);
        return new ResponseEntity<>(registrado, HttpStatus.CREATED);
    }
}
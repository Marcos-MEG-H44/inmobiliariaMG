package com.mg.Inmobiliaria.service;

import com.mg.Inmobiliaria.dto.PagoDTO;
import com.mg.Inmobiliaria.model.Contrato;
import com.mg.Inmobiliaria.model.Pago;
import com.mg.Inmobiliaria.repository.ContratoRepository;
import com.mg.Inmobiliaria.repository.PagoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio encargado de gestionar el registro y actualización de pagos de alquileres.
 */
@Service
@RequiredArgsConstructor
public class PagoService {

    private final PagoRepository pagoRepository;
    private final ContratoRepository contratoRepository;

    @Transactional(readOnly = true)
    public List<PagoDTO> obtenerTodos() {
        return pagoRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PagoDTO> obtenerPorContrato(Long contratoId) {
        return pagoRepository.findByContratoId(contratoId)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PagoDTO registrarPago(PagoDTO dto) {
        Contrato contrato = contratoRepository.findById(dto.getContratoId())
                .orElseThrow(() -> new RuntimeException("Contrato no encontrado con ID: " + dto.getContratoId()));

        Pago pago = Pago.builder()
                .contrato(contrato)
                .periodo(dto.getPeriodo())
                .monto(dto.getMonto())
                .montoHonorarios(dto.getMontoHonorarios())
                .fechaVencimiento(dto.getFechaVencimiento())
                .fechaPago(LocalDateTime.now())
                .estado(Pago.EstadoPago.PAGADO)
                .comprobanteUrl(dto.getComprobanteUrl())
                .build();

        Pago guardado = pagoRepository.save(pago);
        return convertirADTO(guardado);
    }

    private PagoDTO convertirADTO(Pago entidad) {
        return PagoDTO.builder()
                .id(entidad.getId())
                .contratoId(entidad.getContrato() != null ? entidad.getContrato().getId() : null)
                .periodo(entidad.getPeriodo())
                .monto(entidad.getMonto())
                .montoHonorarios(entidad.getMontoHonorarios())
                .fechaVencimiento(entidad.getFechaVencimiento())
                .fechaPago(entidad.getFechaPago())
                .estado(entidad.getEstado())
                .comprobanteUrl(entidad.getComprobanteUrl())
                .build();
    }
}
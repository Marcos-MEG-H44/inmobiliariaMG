package com.mg.Inmobiliaria.dto;

import com.mg.Inmobiliaria.model.Contrato.EstadoContrato;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO para la gestión de contratos de alquiler.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContratoDTO {

    private Long id;
    private Long propiedadId;
    private String propiedadTitulo;
    private Long inquilinoId;
    private String inquilinoNombreCompleto;
    private Long agenteId;
    private String agenteNombreCompleto;
    private BigDecimal montoMensual;
    private BigDecimal porcentajeHonorarios;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private Integer diaVencimientoPago;
    private EstadoContrato estado;
}
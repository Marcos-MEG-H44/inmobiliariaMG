package com.mg.Inmobiliaria.dto;

import com.mg.Inmobiliaria.model.Pago.EstadoPago;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO para el envío y recepción de registros de pagos de cuotas.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PagoDTO {

    private Long id;
    private Long contratoId;
    private String periodo;
    private BigDecimal monto;
    private BigDecimal montoHonorarios;
    private LocalDate fechaVencimiento;
    private LocalDateTime fechaPago;
    private EstadoPago estado;
    private String comprobanteUrl;
}
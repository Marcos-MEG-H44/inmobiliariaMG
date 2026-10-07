package com.mg.Inmobiliaria.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entidad JPA que mapea la tabla 'pagos' en la base de datos MySQL.
 * Registra las cuotas o alquileres abonados según el contrato.
 */
@Entity
@Table(name = "pagos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con el contrato correspondiente
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contrato_id", nullable = false)
    private Contrato contrato;

    // Período de pago (Formato esperado: "YYYY-MM", ej. "2026-03")
    @Column(name = "periodo", nullable = false, length = 7)
    private String periodo;

    @Column(name = "monto", nullable = false, precision = 15, scale = 2)
    private BigDecimal monto;

    @Column(name = "monto_honorarios", precision = 15, scale = 2)
    private BigDecimal montoHonorarios;

    @Column(name = "fecha_vencimiento")
    private LocalDate fechaVencimiento;

    @Column(name = "fecha_pago")
    private LocalDateTime fechaPago;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", length = 20)
    private EstadoPago estado;

    @Column(name = "comprobante_url", length = 255)
    private String comprobanteUrl;

    @PrePersist
    protected void onCreate() {
        if (this.estado == null) {
            this.estado = EstadoPago.PENDIENTE;
        }
    }

    public enum EstadoPago {
        PENDIENTE, PAGADO, MOROSO
    }
}
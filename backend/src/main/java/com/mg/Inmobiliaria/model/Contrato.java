package com.mg.Inmobiliaria.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Entidad JPA que mapea la tabla 'contratos' en MySQL.
 * Representa la relación contractual entre una propiedad, un inquilino y un agente inmobiliario.
 */
@Entity
@Table(name = "contratos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contrato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Propiedad asociada al contrato
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "propiedad_id", nullable = false)
    private Propiedad propiedad;

    // Usuario registrado como inquilino
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inquilino_id", nullable = false)
    private Usuario inquilino;

    // Usuario (agente / admin) responsable de la operación
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agente_id", nullable = true)
    private Usuario agente;

    @Column(name = "monto_mensual", nullable = false, precision = 15, scale = 2)
    private BigDecimal montoMensual;

    @Column(name = "porcentaje_honorarios", precision = 5, scale = 2)
    private BigDecimal porcentajeHonorarios;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Column(name = "dia_vencimiento_pago")
    private Integer diaVencimientoPago;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", length = 20)
    private EstadoContrato estado;

    @PrePersist
    protected void onCreate() {
        if (this.estado == null) {
            this.estado = EstadoContrato.ACTIVO;
        }
        if (this.diaVencimientoPago == null) {
            this.diaVencimientoPago = 10; // Valor por defecto: día 10 de cada mes
        }
    }

    public enum EstadoContrato {
        ACTIVO, FINALIZADO, CANCELADO
    }
}
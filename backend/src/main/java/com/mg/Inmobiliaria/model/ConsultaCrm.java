package com.mg.Inmobiliaria.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entidad JPA que mapea la tabla 'consultas_crm' en la base de datos MySQL.
 * Almacena las consultas realizadas por clientes sobre las propiedades.
 */
@Entity
@Table(name = "consultas_crm")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultaCrm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación ManyToOne con Propiedad (varias consultas pueden corresponder a una propiedad)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "propiedad_id", nullable = true)
    private Propiedad propiedad;

    // Relación ManyToOne con Usuario si el cliente está registrado (opcional)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = true)
    private Usuario cliente;

    @Column(name = "nombre_contacto", nullable = false, length = 150)
    private String nombreContacto;

    @Column(name = "email_contacto", nullable = false, length = 150)
    private String emailContacto;

    @Column(name = "telefono_contacto", length = 30)
    private String telefonoContacto;

    @Column(name = "mensaje", columnDefinition = "TEXT")
    private String mensaje;

    // Enumeración para el origen de la consulta (WEB, WHATSAPP, EMAIL)
    @Enumerated(EnumType.STRING)
    @Column(name = "origen", length = 20)
    private OrigenConsulta origen;

    // Enumeración para el estado de seguimiento CRM
    @Enumerated(EnumType.STRING)
    @Column(name = "estado", length = 20)
    private EstadoConsulta estado;

    @Column(name = "fecha_consulta", updatable = false)
    private LocalDateTime fechaConsulta;

    // Método de ciclo de vida JPA para establecer la fecha automática antes de insertar
    @PrePersist
    protected void onCreate() {
        this.fechaConsulta = LocalDateTime.now();
        if (this.estado == null) {
            this.estado = EstadoConsulta.PENDIENTE;
        }
        if (this.origen == null) {
            this.origen = OrigenConsulta.WEB;
        }
    }

    // Enum interno o secundario para OrigendelaConsulta
    public enum OrigenConsulta {
        WEB, WHATSAPP, EMAIL
    }

    // Enum interno o secundario para EstadoConsulta
    public enum EstadoConsulta {
        PENDIENTE, EN_PROCESO, ATENDIDA, CANCELADA
    }
}
package com.mg.Inmobiliaria.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entidad JPA que mapea la tabla 'notificaciones' en MySQL.
 * Gestiona los mensajes y alertas enviados a los usuarios del sistema.
 */
@Entity
@Table(name = "notificaciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Usuario destinatario de la notificación
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "titulo", nullable = false, length = 150)
    private String titulo;

    @Column(name = "mensaje", columnDefinition = "TEXT", nullable = false)
    private String mensaje;

    @Column(name = "leida", nullable = false)
    private Boolean leida;

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
        if (this.leida == null) {
            this.leida = false;
        }
    }
}
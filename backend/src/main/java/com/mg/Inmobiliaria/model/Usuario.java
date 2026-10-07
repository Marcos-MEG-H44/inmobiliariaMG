package com.mg.Inmobiliaria.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entidad que representa a un usuario (agente, admin o cliente) dentro del sistema.
 * Incluye el mapeo exacto de la foto de perfil, restricciones de rol seguro y 
 * protecciones de seguridad para la API REST.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "usuarios")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 100)
    private String apellido;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    /**
     * Oculta el campo password en las respuestas JSON enviadas al Frontend.
     * Solo permite escritura al recibir el payload en peticiones HTTP.
     */
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String password;

    @Column(length = 20)
    private String telefono;

    /**
     * Mapea la columna foto_perfil de la base de datos MySQL.
     * Permite almacenar URLs de avatares/imágenes de los usuarios.
     */
    @Column(name = "foto_perfil", length = 255)
    private String fotoPerfil;

    /**
     * Rol asignado dentro del sistema: ADMIN, AGENTE, CLIENTE
     */
    @Column(length = 20)
    private String rol; 

    @Column(nullable = false)
    private Boolean activo;

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    /**
     * Método ejecutado antes de la persistencia en la base de datos.
     * Establece valores por defecto seguros para prevenir elevación no autorizada de privilegios.
     */
    @PrePersist
    protected void onCreate() {
        if (this.fechaCreacion == null) {
            this.fechaCreacion = LocalDateTime.now();
        }
        
        // Asignación segura de Rol por defecto: CLIENTE
        // Previene que usuarios externos se registren con permisos de AGENTE o ADMIN por defecto
        if (this.rol == null || this.rol.trim().isEmpty()) {
            this.rol = "CLIENTE";
        } else {
            // Normaliza el texto a mayúsculas para mantener consistencia
            this.rol = this.rol.trim().toUpperCase();
        }

        if (this.activo == null) {
            this.activo = true;
        }
    }
}
package com.mg.Inmobiliaria.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad principal que representa un inmueble/propiedad inmobiliaria.
 * Permite relacionar propiedades con un agente responsable y sus fotos asociadas.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "propiedades")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Propiedad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_propiedad", nullable = false)
    private TipoPropiedad tipoPropiedad;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_operacion", nullable = false)
    private TipoOperacion tipoOperacion;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal precio;

    @Column(nullable = false, length = 10)
    private String moneda; // ARS, USD, etc.

    @Column(nullable = false)
    private String direccion;

    @Column(nullable = false, length = 100)
    private String ciudad;

    @Column(nullable = false, length = 100)
    private String provincia;

    private Integer ambientes;
    private Integer dormitorios;
    private Integer banos;

    @Column(name = "superficie_total", precision = 10, scale = 2)
    private BigDecimal superficieTotal;

    @Column(name = "superficie_cubierta", precision = 10, scale = 2)
    private BigDecimal superficieCubierta;

    private Boolean cochera;
    private Boolean patio;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoPropiedad estado;

    private Boolean destacada;

    /**
     * Relación con el agente responsable de la propiedad.
     * Se usa JsonIgnoreProperties para ignorar referencias pesadas o proxies de seguridad.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "agente_id", nullable = true)
    @JsonIgnoreProperties({"password", "activo", "fechaCreacion", "hibernateLazyInitializer", "handler"})
    private Usuario agente;

    /**
     * Lista de imágenes asignadas a la propiedad con cascada completa y orphanRemoval
     * para asegurar que se guarden o eliminen junto con la propiedad.
     */
    @OneToMany(mappedBy = "propiedad", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("propiedad")
    @Builder.Default
    private List<FotoPropiedad> fotos = new ArrayList<>();

    @Column(name = "fecha_publicacion", nullable = false, updatable = false)
    private LocalDateTime fechaPublicacion;

    @PrePersist
    protected void onCreate() {
        if (this.fechaPublicacion == null) {
            this.fechaPublicacion = LocalDateTime.now();
        }
        if (this.estado == null) {
            this.estado = EstadoPropiedad.DISPONIBLE;
        }
        if (this.moneda == null) {
            this.moneda = "ARS";
        }
        if (this.ciudad == null) {
            this.ciudad = "Coronel Pringles";
        }
        if (this.provincia == null) {
            this.provincia = "Buenos Aires";
        }
    }
}
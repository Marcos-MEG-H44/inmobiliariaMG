package com.mg.Inmobiliaria.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidad para almacenar las URLs o el contenido en Base64 de las fotografías asociadas a un inmueble.
 * Mantiene la relación bidireccional con Propiedad evitando bucles infinitos de serialización JSON.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "fotos_propiedad")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class FotoPropiedad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Relación con la propiedad a la que pertenece la foto.
     * Se utiliza JsonIgnoreProperties para evitar ciclos infinitos al serializar y deserializar.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "propiedad_id", nullable = false)
    @JsonIgnoreProperties("fotos")
    private Propiedad propiedad;

    /**
     * Se define como columnDefinition = "TEXT" para evitar errores de truncamiento
     * al recibir cadenas largas en Base64 o URLs extensas.
     */
    @Column(name = "url_foto", nullable = false, columnDefinition = "TEXT")
    private String urlFoto;

    @Column(name = "es_principal")
    private Boolean esPrincipal;
}
package com.mg.Inmobiliaria.repository;

import com.mg.Inmobiliaria.model.EstadoPropiedad;
import com.mg.Inmobiliaria.model.Propiedad;
import com.mg.Inmobiliaria.model.TipoOperacion;
import com.mg.Inmobiliaria.model.TipoPropiedad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PropiedadRepository extends JpaRepository<Propiedad, Long> {

    List<Propiedad> findByDestacadaTrueAndEstado(EstadoPropiedad estado);

    @Query("SELECT p FROM Propiedad p WHERE " +
           "(:ciudad IS NULL OR LOWER(p.ciudad) LIKE LOWER(CONCAT('%', :ciudad, '%'))) AND " +
           "(:tipoOperacion IS NULL OR p.tipoOperacion = :tipoOperacion) AND " +
           "(:tipoPropiedad IS NULL OR p.tipoPropiedad = :tipoPropiedad) AND " +
           "(:precioMin IS NULL OR p.precio >= :precioMin) AND " +
           "(:precioMax IS NULL OR p.precio <= :precioMax) AND " +
           "(:ambientes IS NULL OR p.ambientes = :ambientes) AND " +
           "(:dormitorios IS NULL OR p.dormitorios = :dormitorios) AND " +
           "(:estado IS NULL OR p.estado = :estado)")
    List<Propiedad> buscarAvanzado(
            @Param("ciudad") String ciudad,
            @Param("tipoOperacion") TipoOperacion tipoOperacion,
            @Param("tipoPropiedad") TipoPropiedad tipoPropiedad,
            @Param("precioMin") BigDecimal precioMin,
            @Param("precioMax") BigDecimal precioMax,
            @Param("ambientes") Integer ambientes,
            @Param("dormitorios") Integer dormitorios,
            @Param("estado") EstadoPropiedad estado
    );
}
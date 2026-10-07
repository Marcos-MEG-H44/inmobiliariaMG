package com.mg.Inmobiliaria.repository;

import com.mg.Inmobiliaria.model.FotoPropiedad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FotoPropiedadRepository extends JpaRepository<FotoPropiedad, Long> {
    
    List<FotoPropiedad> findByPropiedadId(Long propiedadId);
}
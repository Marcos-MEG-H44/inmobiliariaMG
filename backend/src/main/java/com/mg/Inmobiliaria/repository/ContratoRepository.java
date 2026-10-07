package com.mg.Inmobiliaria.repository;

import com.mg.Inmobiliaria.model.Contrato;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio JPA para realizar operaciones CRUD y consultas
 * sobre la entidad Contrato en MySQL.
 */
@Repository
public interface ContratoRepository extends JpaRepository<Contrato, Long> {

    // Buscar contratos por inquilino
    List<Contrato> findByInquilinoId(Long inquilinoId);

    // Buscar contratos por propiedad
    List<Contrato> findByPropiedadId(Long propiedadId);

    // Buscar contratos por estado (ACTIVO, FINALIZADO, CANCELADO)
    List<Contrato> findByEstado(Contrato.EstadoContrato estado);

    // Buscar contratos vinculados a un agente específico
    List<Contrato> findByAgenteId(Long agenteId);
}
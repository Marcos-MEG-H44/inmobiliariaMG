package com.mg.Inmobiliaria.repository;

import com.mg.Inmobiliaria.model.ConsultaCrm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio JPA para realizar operaciones CRUD y consultas avanzadas
 * sobre la entidad ConsultaCrm en MySQL.
 */
@Repository
public interface ConsultaCrmRepository extends JpaRepository<ConsultaCrm, Long> {

    // Buscar todas las consultas ordenadas por fecha de llegada (más recientes primero)
    List<ConsultaCrm> findAllByOrderByFechaConsultaDesc();

    // Buscar consultas asignadas al agente de la propiedad, ordenadas por fecha de llegada
    List<ConsultaCrm> findByPropiedadAgenteIdOrderByFechaConsultaDesc(Long agenteId);

    // Buscar todas las consultas asociadas a una propiedad específica
    List<ConsultaCrm> findByPropiedadId(Long propiedadId);

    // Buscar consultas filtradas por estado (PENDIENTE, EN_PROCESO, etc.)
    List<ConsultaCrm> findByEstado(ConsultaCrm.EstadoConsulta estado);

    // Buscar consultas realizadas por un cliente en particular
    List<ConsultaCrm> findByClienteId(Long clienteId);
}
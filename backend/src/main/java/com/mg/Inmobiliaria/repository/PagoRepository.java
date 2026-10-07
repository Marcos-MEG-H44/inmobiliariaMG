package com.mg.Inmobiliaria.repository;

import com.mg.Inmobiliaria.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio JPA para realizar operaciones de persistencia e itinerario de pagos.
 */
@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {

    // Buscar todos los pagos asociados a un contrato
    List<Pago> findByContratoId(Long contratoId);

    // Buscar pagos según su estado (PENDIENTE, PAGADO, MOROSO)
    List<Pago> findByEstado(Pago.EstadoPago estado);

    // Buscar un pago por contrato y período específico (ej. contratoId=1, periodo="2026-03")
    Optional<Pago> findByContratoIdAndPeriodo(Long contratoId, String periodo);
}
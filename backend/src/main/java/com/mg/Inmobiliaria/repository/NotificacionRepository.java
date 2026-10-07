package com.mg.Inmobiliaria.repository;

import com.mg.Inmobiliaria.model.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio JPA para realizar operaciones sobre las notificaciones del sistema.
 */
@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    // Obtener notificaciones de un usuario ordenadas por fecha (las más recientes primero)
    List<Notificacion> findByUsuarioIdOrderByFechaCreacionDesc(Long usuarioId);

    // Obtener notificaciones no leídas de un usuario
    List<Notificacion> findByUsuarioIdAndLeidaFalse(Long usuarioId);
}
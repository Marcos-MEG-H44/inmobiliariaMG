package com.mg.Inmobiliaria.service;

import com.mg.Inmobiliaria.model.Notificacion;
import com.mg.Inmobiliaria.model.Usuario;
import com.mg.Inmobiliaria.repository.NotificacionRepository;
import com.mg.Inmobiliaria.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Servicio encargado de enviar y consultar notificaciones de los usuarios.
 */
@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<Notificacion> obtenerPorUsuario(Long usuarioId) {
        return notificacionRepository.findByUsuarioIdOrderByFechaCreacionDesc(usuarioId);
    }

    @Transactional
    public Notificacion crearNotificacion(Long usuarioId, String titulo, String mensaje) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + usuarioId));

        Notificacion notificacion = Notificacion.builder()
                .usuario(usuario)
                .titulo(titulo)
                .mensaje(mensaje)
                .leida(false)
                .build();

        return notificacionRepository.save(notificacion);
    }

    @Transactional
    public void marcarComoLeida(Long notificacionId) {
        Notificacion notificacion = notificacionRepository.findById(notificacionId)
                .orElseThrow(() -> new RuntimeException("Notificación no encontrada con ID: " + notificacionId));

        notificacion.setLeida(true);
        notificacionRepository.save(notificacion);
    }
}
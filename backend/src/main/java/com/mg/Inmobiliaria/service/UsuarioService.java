package com.mg.Inmobiliaria.service;

import com.mg.Inmobiliaria.model.Usuario;
import com.mg.Inmobiliaria.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Servicio encargado de la lógica de negocio para la gestión de usuarios,
 * autenticación y registro de datos.
 */
@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> obtenerPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    public Optional<Usuario> obtenerPorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    /**
     * Busca un usuario directamente por su correo electrónico.
     * Retorna el objeto Usuario o null si no lo encuentra.
     */
    public Usuario buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email).orElse(null);
    }

    public Usuario guardar(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    public void eliminar(Long id) {
        usuarioRepository.deleteById(id);
    }

    /**
     * Procesa el registro de un nuevo usuario desde un Map genérico
     * para evitar errores por falta del DTO.
     */
    public Usuario registrarUsuario(Map<String, String> datosRegistro) throws Exception {
        String email = datosRegistro.get("email");

        // Verifica si el correo ya existe en la base de datos
        if (email != null && usuarioRepository.findByEmail(email).isPresent()) {
            throw new Exception("El email ya se encuentra registrado.");
        }

        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setNombre(datosRegistro.get("nombre"));
        nuevoUsuario.setApellido(datosRegistro.get("apellido"));
        nuevoUsuario.setEmail(email);
        nuevoUsuario.setPassword(datosRegistro.get("password"));
        nuevoUsuario.setTelefono(datosRegistro.get("telefono"));

        // Manejo de rol como String (ADMIN, AGENTE, CLIENTE)
        String rolRecibido = datosRegistro.get("rol");
        if (rolRecibido != null && !rolRecibido.trim().isEmpty()) {
            nuevoUsuario.setRol(rolRecibido.toUpperCase());
        } else {
            nuevoUsuario.setRol("CLIENTE");
        }

        return usuarioRepository.save(nuevoUsuario);
    }
}
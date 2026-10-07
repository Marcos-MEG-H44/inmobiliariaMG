package com.mg.Inmobiliaria.controller;

import com.mg.Inmobiliaria.model.Usuario;
import com.mg.Inmobiliaria.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

/**
 * Controlador REST para gestionar la autenticación (Login) y el registro seguro
 * de usuarios en el sistema inmobiliario.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * Autentica un usuario mediante sus credenciales (email y contraseña).
     *
     * @param credentials Mapa que contiene las claves "email" y "password".
     * @return Objeto Usuario autenticado con sus datos y rol, o mensaje de error.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        if (email == null || password == null || email.isBlank() || password.isBlank()) {
            return ResponseEntity.badRequest().body("El email y la contraseña son obligatorios.");
        }

        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email.trim().toLowerCase());

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales inválidas.");
        }

        Usuario usuario = usuarioOpt.get();

        // Validación de contraseña
        if (!usuario.getPassword().equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales inválidas.");
        }

        if (Boolean.FALSE.equals(usuario.getActivo())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Esta cuenta se encuentra desactivada.");
        }

        return ResponseEntity.ok(usuario);
    }

    /**
     * Endpoint público para el registro de nuevos clientes.
     * Garantiza por seguridad que el rol asignado sea únicamente CLIENTE.
     *
     * @param nuevoUsuario Objeto usuario enviado desde el formulario de registro.
     * @return Usuario registrado en la base de datos.
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Usuario nuevoUsuario) {
        if (nuevoUsuario.getEmail() == null || nuevoUsuario.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body("El correo electrónico es obligatorio.");
        }

        String emailNormalizado = nuevoUsuario.getEmail().trim().toLowerCase();

        if (usuarioRepository.existsByEmail(emailNormalizado)) {
            return ResponseEntity.badRequest().body("El correo electrónico ya se encuentra registrado.");
        }

        // Asignación de datos y seguridad
        nuevoUsuario.setEmail(emailNormalizado);
        nuevoUsuario.setRol("CLIENTE");

        Usuario usuarioGuardado = usuarioRepository.save(nuevoUsuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioGuardado);
    }
}
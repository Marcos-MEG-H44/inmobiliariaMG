package com.mg.Inmobiliaria.repository;

import com.mg.Inmobiliaria.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio Spring Data JPA para la entidad Usuario.
 * Proporciona métodos de acceso a datos para autenticación, validación de correo 
 * y gestión de usuarios por rol dentro del sistema inmobiliario.
 */
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    /**
     * Busca un usuario activo o inactivo por su dirección de correo electrónico única.
     * Utilizado para el proceso de Inicio de Sesión (Login).
     *
     * @param email Dirección de correo electrónico a consultar.
     * @return Optional con el Usuario encontrado o vacío si no existe.
     */
    Optional<Usuario> findByEmail(String email);
    
    /**
     * Verifica la existencia de un usuario registrado con el correo especificado.
     * Utilizado para validaciones previas durante el Registro.
     *
     * @param email Dirección de correo a comprobar.
     * @return true si ya existe en la base de datos, false de lo contrario.
     */
    Boolean existsByEmail(String email);

    /**
     * Obtiene la lista de usuarios filtrados por su rol (ADMIN, AGENTE, CLIENTE).
     * Útil para listar agentes asignables a propiedades o gestionar clientes.
     *
     * @param rol Nombre del rol a consultar.
     * @return Lista de usuarios que coinciden con el rol.
     */
    List<Usuario> findByRol(String rol);

    /**
     * Obtiene todos los usuarios que tengan un estado activo/inactivo específico.
     *
     * @param activo Estado del usuario a consultar.
     * @return Lista de usuarios según el estado provisto.
     */
    List<Usuario> findByActivo(Boolean activo);
}
package com.mg.Inmobiliaria.service;

import com.mg.Inmobiliaria.dto.ConsultaCrmDTO;
import com.mg.Inmobiliaria.model.ConsultaCrm;
import com.mg.Inmobiliaria.model.Propiedad;
import com.mg.Inmobiliaria.model.Usuario;
import com.mg.Inmobiliaria.repository.ConsultaCrmRepository;
import com.mg.Inmobiliaria.repository.PropiedadRepository;
import com.mg.Inmobiliaria.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio encargado de gestionar las consultas del CRM e integrar los DTOs.
 */
@Service
@RequiredArgsConstructor
public class ConsultaCrmService {

    private final ConsultaCrmRepository consultaCrmRepository;
    private final PropiedadRepository propiedadRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<ConsultaCrmDTO> obtenerTodas() {
        return consultaCrmRepository.findAllByOrderByFechaConsultaDesc()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConsultaCrmDTO> obtenerPorAgente(Long agenteId) {
        return consultaCrmRepository.findByPropiedadAgenteIdOrderByFechaConsultaDesc(agenteId)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConsultaCrmDTO> obtenerPorPropiedad(Long propiedadId) {
        return consultaCrmRepository.findByPropiedadId(propiedadId)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ConsultaCrmDTO crearConsulta(ConsultaCrmDTO dto) {
        Propiedad propiedad = null;
        if (dto.getPropiedadId() != null) {
            propiedad = propiedadRepository.findById(dto.getPropiedadId())
                    .orElse(null);
        }

        Usuario cliente = null;
        if (dto.getClienteId() != null) {
            cliente = usuarioRepository.findById(dto.getClienteId())
                    .orElse(null);
        }

        ConsultaCrm consulta = ConsultaCrm.builder()
                .propiedad(propiedad)
                .cliente(cliente)
                .nombreContacto(dto.getNombreContacto())
                .emailContacto(dto.getEmailContacto())
                .telefonoContacto(dto.getTelefonoContacto())
                .mensaje(dto.getMensaje())
                .origen(dto.getOrigen() != null ? dto.getOrigen() : ConsultaCrm.OrigenConsulta.WEB)
                .estado(ConsultaCrm.EstadoConsulta.PENDIENTE)
                .build();

        ConsultaCrm guardada = consultaCrmRepository.save(consulta);
        return convertirADTO(guardada);
    }

    @Transactional
    public ConsultaCrmDTO cambiarEstado(Long id, ConsultaCrm.EstadoConsulta nuevoEstado) {
        ConsultaCrm consulta = consultaCrmRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consulta no encontrada con ID: " + id));

        consulta.setEstado(nuevoEstado);
        ConsultaCrm actualizada = consultaCrmRepository.save(consulta);
        return convertirADTO(actualizada);
    }

    @Transactional
    public void eliminar(Long id) {
        consultaCrmRepository.deleteById(id);
    }

    private ConsultaCrmDTO convertirADTO(ConsultaCrm entidad) {
        Long agenteId = null;
        String agenteNombre = null;
        String agenteEmail = null;
        if (entidad.getPropiedad() != null && entidad.getPropiedad().getAgente() != null) {
            agenteId = entidad.getPropiedad().getAgente().getId();
            agenteEmail = entidad.getPropiedad().getAgente().getEmail();
            agenteNombre = entidad.getPropiedad().getAgente().getNombre() + " " +
                    (entidad.getPropiedad().getAgente().getApellido() != null ? entidad.getPropiedad().getAgente().getApellido() : "");
        }

        String propiedadDireccion = null;
        String propiedadFoto = null;
        String propiedadEstado = null;

        if (entidad.getPropiedad() != null) {
            propiedadDireccion = entidad.getPropiedad().getDireccion() +
                    (entidad.getPropiedad().getCiudad() != null ? ", " + entidad.getPropiedad().getCiudad() : "");
            propiedadEstado = entidad.getPropiedad().getEstado() != null ? entidad.getPropiedad().getEstado().name() : "DISPONIBLE";

            if (entidad.getPropiedad().getFotos() != null && !entidad.getPropiedad().getFotos().isEmpty()) {
                propiedadFoto = entidad.getPropiedad().getFotos().get(0).getUrlFoto();
            }
        }

        return ConsultaCrmDTO.builder()
                .id(entidad.getId())
                .propiedadId(entidad.getPropiedad() != null ? entidad.getPropiedad().getId() : null)
                .propiedadTitulo(entidad.getPropiedad() != null ? entidad.getPropiedad().getTitulo() : "Consulta General")
                .propiedadDireccion(propiedadDireccion)
                .propiedadFoto(propiedadFoto)
                .propiedadEstado(propiedadEstado)
                .agenteId(agenteId)
                .agenteNombre(agenteNombre != null ? agenteNombre.trim() : "Sin Agente")
                .agenteEmail(agenteEmail)
                .clienteId(entidad.getCliente() != null ? entidad.getCliente().getId() : null)
                .nombreContacto(entidad.getNombreContacto())
                .emailContacto(entidad.getEmailContacto())
                .telefonoContacto(entidad.getTelefonoContacto())
                .mensaje(entidad.getMensaje())
                .origen(entidad.getOrigen())
                .estado(entidad.getEstado())
                .fechaConsulta(entidad.getFechaConsulta())
                .build();
    }
}
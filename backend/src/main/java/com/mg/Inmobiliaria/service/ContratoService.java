package com.mg.Inmobiliaria.service;

import com.mg.Inmobiliaria.dto.ContratoDTO;
import com.mg.Inmobiliaria.model.Contrato;
import com.mg.Inmobiliaria.model.Propiedad;
import com.mg.Inmobiliaria.model.Usuario;
import com.mg.Inmobiliaria.repository.ContratoRepository;
import com.mg.Inmobiliaria.repository.PropiedadRepository;
import com.mg.Inmobiliaria.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la administración y validación de contratos de alquiler.
 */
@Service
@RequiredArgsConstructor
public class ContratoService {

    private final ContratoRepository contratoRepository;
    private final PropiedadRepository propiedadRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<ContratoDTO> obtenerTodos() {
        return contratoRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ContratoDTO> obtenerPorInquilino(Long inquilinoId) {
        return contratoRepository.findByInquilinoId(inquilinoId)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ContratoDTO crearContrato(ContratoDTO dto) {
        Propiedad propiedad = propiedadRepository.findById(dto.getPropiedadId())
                .orElseThrow(() -> new RuntimeException("Propiedad no encontrada con ID: " + dto.getPropiedadId()));

        Usuario inquilino = usuarioRepository.findById(dto.getInquilinoId())
                .orElseThrow(() -> new RuntimeException("Inquilino no encontrado con ID: " + dto.getInquilinoId()));

        Usuario agente = null;
        if (dto.getAgenteId() != null) {
            agente = usuarioRepository.findById(dto.getAgenteId()).orElse(null);
        }

        Contrato contrato = Contrato.builder()
                .propiedad(propiedad)
                .inquilino(inquilino)
                .agente(agente)
                .montoMensual(dto.getMontoMensual())
                .porcentajeHonorarios(dto.getPorcentajeHonorarios())
                .fechaInicio(dto.getFechaInicio())
                .fechaFin(dto.getFechaFin())
                .diaVencimientoPago(dto.getDiaVencimientoPago() != null ? dto.getDiaVencimientoPago() : 10)
                .estado(Contrato.EstadoContrato.ACTIVO)
                .build();

        Contrato guardado = contratoRepository.save(contrato);
        return convertirADTO(guardado);
    }

    private ContratoDTO convertirADTO(Contrato entidad) {
        String nombreInquilino = entidad.getInquilino() != null ? 
                entidad.getInquilino().getNombre() + " " + entidad.getInquilino().getApellido() : "Sin Inquilino";
        
        String nombreAgente = entidad.getAgente() != null ? 
                entidad.getAgente().getNombre() + " " + entidad.getAgente().getApellido() : "Sin Agente";

        return ContratoDTO.builder()
                .id(entidad.getId())
                .propiedadId(entidad.getPropiedad() != null ? entidad.getPropiedad().getId() : null)
                .propiedadTitulo(entidad.getPropiedad() != null ? entidad.getPropiedad().getTitulo() : "Propiedad")
                .inquilinoId(entidad.getInquilino() != null ? entidad.getInquilino().getId() : null)
                .inquilinoNombreCompleto(nombreInquilino)
                .agenteId(entidad.getAgente() != null ? entidad.getAgente().getId() : null)
                .agenteNombreCompleto(nombreAgente)
                .montoMensual(entidad.getMontoMensual())
                .porcentajeHonorarios(entidad.getPorcentajeHonorarios())
                .fechaInicio(entidad.getFechaInicio())
                .fechaFin(entidad.getFechaFin())
                .diaVencimientoPago(entidad.getDiaVencimientoPago())
                .estado(entidad.getEstado())
                .build();
    }
}
package com.mg.Inmobiliaria.dto;

import com.mg.Inmobiliaria.model.ConsultaCrm.EstadoConsulta;
import com.mg.Inmobiliaria.model.ConsultaCrm.OrigenConsulta;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para transferir la información de las consultas del CRM al Frontend.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultaCrmDTO {

    private Long id;
    private Long propiedadId;
    private String propiedadTitulo;
    private String propiedadDireccion;
    private String propiedadFoto;
    private String propiedadEstado;
    private Long agenteId;
    private String agenteNombre;
    private String agenteEmail;
    private Long clienteId;
    private String nombreContacto;
    private String emailContacto;
    private String telefonoContacto;
    private String mensaje;
    private OrigenConsulta origen;
    private EstadoConsulta estado;
    private LocalDateTime fechaConsulta;
}
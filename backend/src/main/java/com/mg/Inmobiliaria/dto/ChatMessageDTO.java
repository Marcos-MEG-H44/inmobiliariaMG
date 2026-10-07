package com.mg.Inmobiliaria.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para la transferencia de mensajes de chat en tiempo real.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {
    private String emisor;      // Nombre o id del usuario/agente
    private String contenido;   // Texto del mensaje
    private String tipo;        // CHAT, JOIN, LEAVE
    private Long propiedadId;   // ID de la propiedad sobre la que se consulta (opcional)
}
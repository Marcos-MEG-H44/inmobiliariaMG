package com.mg.Inmobiliaria.controller;

import com.mg.Inmobiliaria.dto.ChatMessageDTO;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

/**
 * Controlador de WebSockets para procesar el chat de consultas en tiempo real.
 */
@Controller
public class ChatController {

    /**
     * Recibe mensajes dirigidos a "/app/chat.sendMessage" y los retransmite a los suscritos en "/topic/public"
     */
    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessageDTO sendMessage(@Payload ChatMessageDTO chatMessage) {
        return chatMessage;
    }

    /**
     * Notifica el ingreso de un nuevo usuario a la sala de chat
     */
    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessageDTO addUser(@Payload ChatMessageDTO chatMessage) {
        chatMessage.setContenido(chatMessage.getEmisor() + " se ha conectado al chat de consultas.");
        return chatMessage;
    }
}
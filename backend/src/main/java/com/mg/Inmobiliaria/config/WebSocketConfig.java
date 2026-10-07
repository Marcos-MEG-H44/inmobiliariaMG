package com.mg.Inmobiliaria.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Configuración de WebSockets con STOMP y SockJS para el chat en vivo.
 * Incluye la habilitación explícita de CORS para permitir conexiones desde el cliente React (Vite).
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Habilita el broker para enviar mensajes a los clientes suscritos al prefijo "/topic"
        config.enableSimpleBroker("/topic");
        
        // Prefijo para los mensajes que envían los clientes hacia los controladores (@MessageMapping)
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint WebSocket con soporte de SockJS y habilitación de origin patterns para React Vite
        registry.addEndpoint("/ws-inmobiliaria")
                .setAllowedOriginPatterns("http://localhost:*", "http://127.0.0.1:*", "https://localhost:*")
                .withSockJS();
    }
}
package com.mg.Inmobiliaria.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Configuración de seguridad para permitir peticiones HTTP sin restricciones durante la fase de desarrollo,
 * mapear el acceso a recursos estáticos (/img/**, /uploads/**) y resolver conflictos de CORS con credenciales.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Aplica la configuración explícita de CORS definida en el Bean corsConfigurationSource()
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // Deshabilitar CSRF para permitir peticiones POST, PUT, DELETE desde el cliente React
            .csrf(AbstractHttpConfigurer::disable)
            // Permitir el acceso público a imágenes locales, endpoints de API y demás rutas en desarrollo
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/img/**", "/uploads/**").permitAll()
                .requestMatchers("/api/**").permitAll()
                .anyRequest().permitAll()
            );

        return http.build();
    }

    /**
     * Define la política global de CORS para la aplicación.
     * Utiliza setAllowedOriginPatterns con patrones explícitos de desarrollo (http://localhost:*, http://127.0.0.1:*)
     * para permitir el envío de credenciales/cookies/tokens sin entrar en conflicto con la especificación CORS.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Permite orígenes de desarrollo de React / Vite (localhost y 127.0.0.1 en cualquier puerto)
        configuration.setAllowedOriginPatterns(List.of(
            "http://localhost:*",
            "http://127.0.0.1:*",
            "https://localhost:*"
        ));
        
        // Métodos HTTP permitidos para las peticiones REST
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        
        // Cabeceras permitidas en las solicitudes
        configuration.setAllowedHeaders(List.of("*"));

        // Cabeceras expuestas al cliente
        configuration.setExposedHeaders(List.of("Authorization", "Content-Type", "Cache-Control"));
        
        // Habilita el intercambio de credenciales/cookies/tokens entre dominios
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
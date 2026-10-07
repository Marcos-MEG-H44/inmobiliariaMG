package com.mg.Inmobiliaria.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuración de Spring MVC para la gestión de recursos estáticos (imágenes locales de XAMPP).
 * La gestión de CORS se delega centralizadamente a SecurityConfig.java para evitar cabeceras duplicadas.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * Mapea las peticiones HTTP de recursos estáticos (/img/** y /uploads/**) 
     * hacia las carpetas físicas correspondientes en el disco de XAMPP (C:/xampp/img/).
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/img/**")
                .addResourceLocations("file:///C:/xampp/img/");

        registry.addResourceHandler("/uploads/propiedades/**")
                .addResourceLocations("file:///C:/xampp/img/propiedades/");

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:///C:/xampp/img/propiedades/", "file:///C:/xampp/img/");
    }
}
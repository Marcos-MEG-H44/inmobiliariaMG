package com.mg.Inmobiliaria;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Clase principal de inicio para la aplicación Spring Boot "Inmobiliaria MG".
 * Inicializa el contexto de Spring, habilita los repositorios JPA y arranca el servidor backend.
 */
@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.mg.Inmobiliaria.repository")
public class InmobiliariaApplication {

    /**
     * Punto de entrada principal del sistema.
     * @param args Argumentos de la línea de comandos.
     */
    public static void main(String[] args) {
        SpringApplication.run(InmobiliariaApplication.class, args);
    }
}
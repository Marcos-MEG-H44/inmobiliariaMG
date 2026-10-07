package com.mg.Inmobiliaria.config;

import com.mg.Inmobiliaria.model.*;
import com.mg.Inmobiliaria.repository.PropiedadRepository;
import com.mg.Inmobiliaria.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.File;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Componente para sembrar y garantizar la integridad de agentes y propiedades,
 * incluyendo la detección automática de formatos locales (.jpeg, .jpg, .png, .webp)
 * para las fotos de perfil y las imágenes de los inmuebles desde XAMPP.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PropiedadRepository propiedadRepository;

    // Directorio físico en XAMPP donde se almacenan todas las imágenes del sistema
    private static final String XAMPP_IMG_DIR = "C:/xampp/img/";

    @Override
    public void run(String... args) throws Exception {

        // 1. Sincronizar Equipo de Agentes con fotos locales dinámicas
        Usuario marcos = sincronizarUsuario("admin@inmobiliariamg.com", "Marcos", "Godoy", "+54 2923 410901", "ADMIN", "Marcos");
        Usuario analia = sincronizarUsuario("analia.gibelli@inmobiliariamg.com", "Analia", "Gibelli", "+54 2923 408097", "AGENTE", "Analia");
        Usuario martin = sincronizarUsuario("martin.godoy@inmobiliariamg.com", "Martin", "Godoy", "+54 2922 432101", "AGENTE", "Martin");
        Usuario antonella = sincronizarUsuario("antonella.godoy@inmobiliariamg.com", "Antonella", "Godoy", "+54 2922 424945", "AGENTE", "Antonella");

        List<Usuario> agentesEquipo = Arrays.asList(marcos, analia, martin, antonella);

        // 2. Crear o actualizar propiedades iniciales con sus respectivas fotos en XAMPP
        if (propiedadRepository.count() == 0) {

            // Fotos para la casa céntrica
            List<FotoPropiedad> fotosCasa = new ArrayList<>();
            fotosCasa.add(crearFoto(XAMPP_IMG_DIR, "casa1", true));
            fotosCasa.add(crearFoto(XAMPP_IMG_DIR, "casa1_2", false));

            Propiedad casaCentrica = Propiedad.builder()
                    .titulo("Casa céntrica con patio amplio")
                    .descripcion("Hermosa propiedad refaccionada a nueva en zona céntrica de Coronel Pringles.")
                    .tipoPropiedad(TipoPropiedad.CASA)
                    .tipoOperacion(TipoOperacion.VENTA)
                    .precio(new BigDecimal("75000.00"))
                    .moneda("USD")
                    .direccion("San Martín 450")
                    .ciudad("Coronel Pringles")
                    .provincia("Buenos Aires")
                    .ambientes(4)
                    .dormitorios(2)
                    .banos(1)
                    .superficieTotal(new BigDecimal("250.00"))
                    .superficieCubierta(new BigDecimal("110.00"))
                    .cochera(true)
                    .patio(true)
                    .estado(EstadoPropiedad.DISPONIBLE)
                    .destacada(true)
                    .agente(marcos)
                    .fotos(fotosCasa)
                    .build();
            
            for (FotoPropiedad foto : fotosCasa) {
                foto.setPropiedad(casaCentrica);
            }

            // Fotos para el departamento moderno
            List<FotoPropiedad> fotosDepto = new ArrayList<>();
            fotosDepto.add(crearFoto(XAMPP_IMG_DIR, "depto1", true));

            Propiedad deptoModerno = Propiedad.builder()
                    .titulo("Departamento moderno 2 ambientes")
                    .descripcion("Departamento luminoso e ideal para estudiantes o parejas.")
                    .tipoPropiedad(TipoPropiedad.DEPARTAMENTO)
                    .tipoOperacion(TipoOperacion.ALQUILER)
                    .precio(new BigDecimal("180000.00"))
                    .moneda("ARS")
                    .direccion("Avenida 25 de Mayo 1200")
                    .ciudad("Coronel Pringles")
                    .provincia("Buenos Aires")
                    .ambientes(2)
                    .dormitorios(1)
                    .banos(1)
                    .superficieTotal(new BigDecimal("50.00"))
                    .superficieCubierta(new BigDecimal("50.00"))
                    .cochera(false)
                    .patio(false)
                    .estado(EstadoPropiedad.DISPONIBLE)
                    .destacada(true)
                    .agente(analia)
                    .fotos(fotosDepto)
                    .build();

            for (FotoPropiedad foto : fotosDepto) {
                foto.setPropiedad(deptoModerno);
            }

            // Fotos para el local comercial
            List<FotoPropiedad> fotosLocal = new ArrayList<>();
            fotosLocal.add(crearFoto(XAMPP_IMG_DIR, "local1", true));

            Propiedad localComercial = Propiedad.builder()
                    .titulo("Local Comercial Zona Centro")
                    .descripcion("Excelente local comercial ubicado sobre calle comercial de alto tránsito peatonal.")
                    .tipoPropiedad(TipoPropiedad.LOCAL)
                    .tipoOperacion(TipoOperacion.ALQUILER)
                    .precio(new BigDecimal("450000.00"))
                    .moneda("ARS")
                    .direccion("Rivadavia 400")
                    .ciudad("Coronel Pringles")
                    .provincia("Buenos Aires")
                    .ambientes(2)
                    .dormitorios(0)
                    .banos(1)
                    .superficieTotal(new BigDecimal("80.00"))
                    .superficieCubierta(new BigDecimal("80.00"))
                    .cochera(false)
                    .patio(false)
                    .estado(EstadoPropiedad.DISPONIBLE)
                    .destacada(true)
                    .agente(martin)
                    .fotos(fotosLocal)
                    .build();

            for (FotoPropiedad foto : fotosLocal) {
                foto.setPropiedad(localComercial);
            }

            propiedadRepository.save(casaCentrica);
            propiedadRepository.save(deptoModerno);
            propiedadRepository.save(localComercial);

            System.out.println(">>> [DataSeeder] Propiedades y sus respectivas fotos locales sembradas exitosamente.");
        } else {
            // Rotar agentes en las propiedades existentes si ya fueron creadas
            List<Propiedad> listaPropiedades = propiedadRepository.findAll();
            for (int i = 0; i < listaPropiedades.size(); i++) {
                Propiedad prop = listaPropiedades.get(i);
                prop.setAgente(agentesEquipo.get(i % agentesEquipo.size()));
                propiedadRepository.save(prop);
            }
            System.out.println(">>> [DataSeeder] Sincronización completa de agentes en propiedades existentes.");
        }
    }

    /**
     * Helper para sincronizar usuarios y detectar su extensión de imagen en XAMPP.
     */
    private Usuario sincronizarUsuario(String email, String nombre, String apellido, String telefono, String rol, String nombreBaseArchivo) {
        Usuario usuario = usuarioRepository.findByEmail(email).orElseGet(() ->
                Usuario.builder().email(email).build()
        );

        usuario.setNombre(nombre);
        usuario.setApellido(apellido);
        usuario.setTelefono(telefono);
        usuario.setRol(rol);
        usuario.setPassword("agente123");
        usuario.setActivo(true);

        String extensionEncontrada = detectarExtensionImagen(XAMPP_IMG_DIR, nombreBaseArchivo);
        String fotoUrlDinamica = "http://localhost:8080/img/" + nombreBaseArchivo + "." + extensionEncontrada;

        if (usuario.getFotoPerfil() == null || 
            usuario.getFotoPerfil().isEmpty() || 
            usuario.getFotoPerfil().contains("unsplash.com") || 
            !usuario.getFotoPerfil().contains(nombreBaseArchivo)) {
            usuario.setFotoPerfil(fotoUrlDinamica);
        }

        return usuarioRepository.save(usuario);
    }

    /**
     * Helper para construir un objeto FotoPropiedad resolviendo la extensión real en disco (jpeg, jpg, png, webp).
     */
    private FotoPropiedad crearFoto(String directorioBase, String nombreBaseArchivo, boolean esPrincipal) {
        String extensionEncontrada = detectarExtensionImagen(directorioBase, nombreBaseArchivo);
        String urlFinal = "http://localhost:8080/img/" + nombreBaseArchivo + "." + extensionEncontrada;

        return FotoPropiedad.builder()
                .urlFoto(urlFinal)
                .esPrincipal(esPrincipal)
                .build();
    }

    /**
     * Busca de forma dinámica qué extensión física existe en la carpeta de XAMPP para el archivo dado.
     */
    private String detectarExtensionImagen(String directorioBase, String nombreArchivo) {
        String[] extensionesComunes = {"jpeg", "jpg", "png", "webp"};
        for (String ext : extensionesComunes) {
            File archivo = new File(directorioBase + nombreArchivo + "." + ext);
            if (archivo.exists()) {
                return ext;
            }
        }
        return "jpeg";
    }
}
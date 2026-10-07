package com.mg.Inmobiliaria.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Servicio encargado exclusivamente de la manipulación de archivos en el sistema de disco.
 * Mantiene la lógica de E/S (Entrada/Salida) separada de la capa de persistencia (Clean Code).
 */
@Service
public class FileStorageService {

    // Ruta base física en el sistema operativo
    private final String RUTA_BASE = "C:/xampp/img/propiedades/";

    /**
     * Guarda una lista de imágenes en la carpeta del ID correspondiente.
     * 
     * @param propiedadId ID de la propiedad para armar la subcarpeta física
     * @param archivos Lista de archivos binariosMultipartFile recibidos
     * @return Lista de cadenas con las rutas relativas listas para guardar en la BD
     */
    public List<String> guardarImagenes(Long propiedadId, List<MultipartFile> archivos) {
        List<String> rutasRelativas = new ArrayList<>();

        // Si no se adjuntaron archivos, retornamos la lista vacía para no interrumpir el flujo
        if (archivos == null || archivos.isEmpty()) {
            return rutasRelativas;
        }

        // Definimos la ruta de la subcarpeta: C:/xampp/img/propiedades/{id}/
        String carpetaDestino = RUTA_BASE + propiedadId + "/";
        File directorio = new File(carpetaDestino);

        // Si el directorio del id no existe, lo crea físicamente en Windows
        if (!directorio.exists()) {
            directorio.mkdirs();
        }

        for (MultipartFile archivo : archivos) {
            if (!archivo.isEmpty()) {
                try {
                    // Generamos un UUID único al inicio del nombre para evitar colisiones entre archivos
                    String nombreOriginal = archivo.getOriginalFilename();
                    String nombreUnico = UUID.randomUUID().toString() + "_" + nombreOriginal;

                    // Copiamos el stream del archivo en la ruta física seleccionada
                    Path rutaFinal = Paths.get(carpetaDestino + nombreUnico);
                    Files.copy(archivo.getInputStream(), rutaFinal, StandardCopyOption.REPLACE_EXISTING);

                    // Formateamos la ruta HTTP relativa que se va a persistir en MySQL
                    String urlRelativa = "/uploads/propiedades/" + propiedadId + "/" + nombreUnico;
                    rutasRelativas.add(urlRelativa);

                } catch (IOException e) {
                    throw new RuntimeException("Error al escribir el archivo en el disco: " + e.getMessage(), e);
                }
            }
        }

        return rutasRelativas;
    }
}
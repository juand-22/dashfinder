package com.dash;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import net.fabricmc.loader.api.FabricLoader;

import java.io.*;
import java.nio.file.Path;

public class DashConfig {

    private static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();
    private static final Path CONFIG_PATH = FabricLoader.getInstance()
            .getConfigDir()
            .resolve("dash.json");

    /** API key de la cuenta (`df_...`), se configura con `/dash key <api-key>`. */
    public String apiKey = "";

    private static DashConfig instance;

    public static DashConfig getInstance() {
        if (instance == null) load();
        return instance;
    }

    public static void load() {
        try {
            File file = CONFIG_PATH.toFile();

            if (!file.exists()) {
                instance = new DashConfig();
                save();
                return;
            }

            try (Reader reader = new FileReader(file)) {
                instance = GSON.fromJson(reader, DashConfig.class);
                if (instance == null) instance = new DashConfig();
            }

        } catch (Exception e) {
            DashMod.LOGGER.warn("[Dash] Error cargando config: " + e.getMessage());
            instance = new DashConfig();
        }
    }

    public static void save() {
        try (Writer writer = new FileWriter(CONFIG_PATH.toFile())) {
            GSON.toJson(instance, writer);
        } catch (Exception e) {
            DashMod.LOGGER.warn("[Dash] Error guardando config: " + e.getMessage());
        }
    }

    public static boolean isConfigured() {
        return isValidApiKey(getInstance().apiKey);
    }

    /** Guarda la API key (la cuenta ya quedó verificada contra el backend). */
    public static void setApiKey(String apiKey) {
        getInstance().apiKey = apiKey;
        save();
    }

    /** Borra la API key guardada: el mod queda desvinculado. */
    public static void unlink() {
        setApiKey("");
    }

    /**
     * Chequeo local para avisar de un error de tipeo antes de pegarle al backend
     * (el backend igual la valida: 401 si no existe).
     */
    public static boolean isValidApiKey(String apiKey) {
        return apiKey != null && apiKey.startsWith("df_") && apiKey.length() > 10;
    }
}

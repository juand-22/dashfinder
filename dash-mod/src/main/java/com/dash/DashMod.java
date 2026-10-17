package com.dash;

import net.fabricmc.api.ModInitializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DashMod implements ModInitializer {

    public static final String MOD_ID = "dash";
    public static final Logger LOGGER = LoggerFactory.getLogger(MOD_ID);

    @Override
    public void onInitialize() {
        LOGGER.info("[Dash] Mod iniciado correctamente.");
        net.fabricmc.loader.api.FabricLoader.getInstance()
                .getModContainer("dash")
                .ifPresent(container -> {
                    LOGGER.info("[Dash] Mod container encontrado: " + container.getMetadata().getId());
                    LOGGER.info("[Dash] Root paths: " + container.getRootPaths());
                });
    }
}
package com.dash.api;

import com.dash.DashChat;
import com.dash.DashConfig;
import com.dash.DashMod;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import net.minecraft.text.Text;
import net.minecraft.util.Formatting;

import java.net.http.HttpResponse;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class ApiSender {

    private static final Gson gson = new Gson();
    private static final ExecutorService executor = Executors.newSingleThreadExecutor();

    /** Manda los jugadores del tab list al backend (`POST /mod/recive`). */
    public static void sendPlayerData(String server, List<JsonObject> players) {
        if (!DashConfig.isConfigured()) return;

        executor.submit(() -> {
            try {
                JsonObject body = new JsonObject();
                body.addProperty("server", server);
                body.add("players", gson.toJsonTree(players));

                HttpResponse<String> response = ApiClient.post("/mod/recive", body);

                DashMod.LOGGER.info("[Dash] /mod/recive → " + response.statusCode());

                if (response.statusCode() == 401) {
                    DashMod.LOGGER.warn("[Dash] API key inválida, desvinculando el mod.");
                    DashConfig.unlink();

                    DashChat.send(Text.literal("API key inválida. Usa ")
                            .formatted(Formatting.RED)
                            .append(Text.literal("/dash key <tu-api-key>").formatted(Formatting.YELLOW)));
                }

            } catch (Exception e) {
                DashMod.LOGGER.warn("[Dash] Error al enviar jugadores: " + e.getMessage());
            }
        });
    }
}

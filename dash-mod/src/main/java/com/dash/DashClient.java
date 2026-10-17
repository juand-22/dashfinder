package com.dash;

import com.dash.api.ApiClient;
import com.dash.api.ApiSender;
import com.google.gson.JsonObject;
import com.mojang.authlib.GameProfile;
import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientTickEvents;
import net.fabricmc.fabric.api.client.networking.v1.ClientPlayConnectionEvents;
import net.minecraft.client.MinecraftClient;
import net.minecraft.client.network.ClientPlayNetworkHandler;
import net.minecraft.text.Text;
import net.minecraft.util.Formatting;

import java.net.http.HttpResponse;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

public class DashClient implements ClientModInitializer {

    private static boolean isConnected = false;
    private static String currentServer = "";

    private static String getProfileName(GameProfile profile) {
        try {
            return (String) GameProfile.class.getMethod("name").invoke(profile);
        } catch (NoSuchMethodException e) {
            try {
                return (String) GameProfile.class.getMethod("getName").invoke(profile);
            } catch (Exception ex) {
                return "unknown";
            }
        } catch (Exception e) {
            return "unknown";
        }
    }

    @Override
    public void onInitializeClient() {
        DashConfig.load();
        DashCommand.register();

        // Conecta el scheduler con el envío real.
        DashScheduler.registerSendTask(() -> {
            MinecraftClient mc = MinecraftClient.getInstance();
            if (mc != null && isConnected && mc.world != null && DashConfig.isConfigured()) {
                sendCurrentData(mc);
            }
        });

        ClientPlayConnectionEvents.JOIN.register((handler, sender, client) -> {
            isConnected = true;

            if (client.getCurrentServerEntry() != null) {
                currentServer = client.getCurrentServerEntry().address;
            } else {
                currentServer = "singleplayer";
            }

            if (!DashConfig.isConfigured()) {
                DashChat.send(Text.literal("No vinculado. Usa ")
                        .formatted(Formatting.GRAY)
                        .append(Text.literal("/dash key <tu-api-key>").formatted(Formatting.YELLOW)));
                return;
            }

            DashMod.LOGGER.info("[Dash] Conectado a: " + currentServer);
            verifyAccount();

            // Envío inicial al conectar — también reinicia el ciclo del scheduler.
            DashScheduler.sendNow();
        });

        ClientPlayConnectionEvents.DISCONNECT.register((handler, client) -> {
            isConnected = false;
            DashMod.LOGGER.info("[Dash] Desconectado de: " + currentServer);
            currentServer = "";
        });

        ClientTickEvents.END_CLIENT_TICK.register(client -> DashScheduler.tick());
    }

    /**
     * Verifica la API key contra `POST /api/mod/configure` (y marca la cuenta
     * como configurada). Si el backend ya no la reconoce, desvincula el mod.
     */
    private static void verifyAccount() {
        CompletableFuture.runAsync(() -> {
            try {
                HttpResponse<String> response = ApiClient.post("/mod/configure", new JsonObject());

                if (response.statusCode() == 200) {
                    DashChat.send(Text.literal("Activo")
                            .formatted(Formatting.GREEN)
                            .append(Text.literal(" · enviando datos de ").formatted(Formatting.GRAY))
                            .append(Text.literal(currentServer).formatted(Formatting.WHITE, Formatting.BOLD)));
                    return;
                }

                if (response.statusCode() == 401) {
                    DashConfig.unlink();
                    DashChat.send(Text.literal("API key inválida. Usa ")
                            .formatted(Formatting.RED)
                            .append(Text.literal("/dash key <tu-api-key>").formatted(Formatting.YELLOW)));
                }
            } catch (Exception e) {
                DashMod.LOGGER.warn("[Dash] Error verificando la API key: " + e.getMessage());
            }
        });
    }

    private static void sendCurrentData(MinecraftClient client) {
        ClientPlayNetworkHandler handler = client.getNetworkHandler();
        if (handler == null) return;

        List<JsonObject> players = handler.getPlayerList()
                .stream()
                .map(entry -> {
                    String nick = getProfileName(entry.getProfile());

                    String rank = null;
                    Text displayName = entry.getDisplayName();
                    if (displayName != null) {
                        String raw = displayName.getString().trim();
                        if (raw.contains(nick)) {
                            String prefix = raw.substring(0, raw.indexOf(nick)).trim();
                            if (!prefix.isEmpty()) rank = prefix;
                        }
                    }

                    JsonObject obj = new JsonObject();
                    obj.addProperty("nick", nick);
                    if (rank != null) obj.addProperty("rank", rank);
                    return obj;
                })
                .collect(Collectors.toList());

        DashMod.LOGGER.info("[Dash] Jugadores en tab: " + players.size());
        ApiSender.sendPlayerData(currentServer, players);
    }
}

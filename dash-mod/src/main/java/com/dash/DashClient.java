package com.dash;

import com.dash.api.ApiClient;
import com.dash.api.ApiSender;
import com.google.gson.JsonObject;
import com.mojang.authlib.GameProfile;
import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientTickEvents;
import net.fabricmc.fabric.api.client.networking.v1.ClientPlayConnectionEvents;
import net.fabricmc.fabric.api.client.screen.v1.ScreenEvents;
import net.fabricmc.fabric.api.client.screen.v1.Screens;
import net.minecraft.client.MinecraftClient;
import net.minecraft.client.gui.screen.multiplayer.MultiplayerScreen;
import net.minecraft.client.gui.tooltip.Tooltip;
import net.minecraft.client.gui.widget.ButtonWidget;
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

        applySavedNick();

        ScreenEvents.AFTER_INIT.register((client, screen, scaledWidth, scaledHeight) -> {
            if (!(screen instanceof MultiplayerScreen multiplayer)) return;

            ButtonWidget button = ButtonWidget.builder(
                            Text.literal("Dash nicknames"),
                            clicked -> client.setScreen(new DashNicknamesScreen(multiplayer)))
                    .dimensions(5, 5, 120, 20)
                    .tooltip(Tooltip.of(Text.literal("Elegí el nick con el que entrar a los servidores")))
                    .build();

            Screens.getButtons(screen).add(button);
        });

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

            String activeNick = DashSession.activeNick();

            if (activeNick != null) {
                DashChat.send(Text.literal("Entrando como ")
                        .formatted(Formatting.GRAY)
                        .append(Text.literal(activeNick).formatted(Formatting.GREEN, Formatting.BOLD))
                        .append(Text.literal(" (cambialo en Dash nicknames)").formatted(Formatting.GRAY)));
            }

            if (!DashConfig.isConfigured()) {
                DashChat.send(Text.literal("No vinculado. Usa ")
                        .formatted(Formatting.GRAY)
                        .append(Text.literal("/dash key <tu-api-key>").formatted(Formatting.YELLOW)));
                return;
            }

            DashMod.LOGGER.info("[Dash] Conectado a: " + currentServer);
            verifyAccount();

            DashScheduler.sendNow();
        });

        ClientPlayConnectionEvents.DISCONNECT.register((handler, client) -> {
            isConnected = false;
            DashMod.LOGGER.info("[Dash] Desconectado de: " + currentServer);
            currentServer = "";
        });

        ClientTickEvents.END_CLIENT_TICK.register(client -> DashScheduler.tick());
    }

    private static void applySavedNick() {
        String savedNick = DashConfig.getActiveNick();

        if (savedNick.isEmpty()) return;

        try {
            DashSession.apply(savedNick);
            DashMod.LOGGER.info("[Dash] Entrando como " + savedNick);
        } catch (Exception e) {
            DashMod.LOGGER.warn("[Dash] No se pudo aplicar el nick " + savedNick + ": " + e.getMessage());
        }
    }

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

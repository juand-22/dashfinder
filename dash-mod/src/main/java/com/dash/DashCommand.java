package com.dash;

import com.dash.api.ApiClient;
import com.google.gson.JsonObject;
import com.mojang.brigadier.arguments.StringArgumentType;
import com.mojang.brigadier.context.CommandContext;
import net.fabricmc.fabric.api.client.command.v2.ClientCommandManager;
import net.fabricmc.fabric.api.client.command.v2.ClientCommandRegistrationCallback;
import net.fabricmc.fabric.api.client.command.v2.FabricClientCommandSource;
import net.minecraft.client.MinecraftClient;
import net.minecraft.text.Text;
import net.minecraft.util.Formatting;

import java.net.http.HttpResponse;
import java.util.concurrent.CompletableFuture;

public class DashCommand {

    public static void register() {
        ClientCommandRegistrationCallback.EVENT.register((dispatcher, registryAccess) -> {

            dispatcher.register(
                    ClientCommandManager.literal("dash")

                            .then(ClientCommandManager.literal("key")
                                    .then(ClientCommandManager.argument("key", StringArgumentType.string())
                                            .executes(ctx -> {
                                                String key = StringArgumentType.getString(ctx, "key").trim();

                                                if (!DashConfig.isValidApiKey(key)) {
                                                    reply(ctx, Text.literal("API key inválida. Copiala desde el panel (empieza con ")
                                                            .formatted(Formatting.RED)
                                                            .append(Text.literal("df_").formatted(Formatting.YELLOW))
                                                            .append(Text.literal(").").formatted(Formatting.RED)));
                                                    return 0;
                                                }

                                                reply(ctx, Text.literal("Verificando API key...").formatted(Formatting.GRAY));

                                                CompletableFuture.runAsync(() -> {
                                                    try {
                                                        HttpResponse<String> response = ApiClient.post(
                                                                "/mod/configure", new JsonObject(), key);

                                                        MinecraftClient.getInstance().execute(() -> {
                                                            if (response.statusCode() == 200) {
                                                                DashConfig.setApiKey(key);

                                                                String username = ApiClient.readUsername(response.body());
                                                                reply(ctx, Text.literal("Vinculado con ")
                                                                        .formatted(Formatting.GREEN)
                                                                        .append(Text.literal(username != null ? username : "tu cuenta")
                                                                                .formatted(Formatting.WHITE, Formatting.BOLD)));

                                                                DashScheduler.sendNow();

                                                            } else if (response.statusCode() == 401) {
                                                                reply(ctx, Text.literal("API key inválida. Verificala en el panel.")
                                                                        .formatted(Formatting.RED));

                                                            } else {
                                                                reply(ctx, Text.literal("Error al conectar con el servidor.")
                                                                        .formatted(Formatting.RED));
                                                            }
                                                        });

                                                    } catch (Exception e) {
                                                        DashMod.LOGGER.warn("[Dash] Error verificando la API key: " + e.getMessage());
                                                        MinecraftClient.getInstance().execute(() ->
                                                                reply(ctx, Text.literal("No se pudo conectar con la API.")
                                                                        .formatted(Formatting.RED)));
                                                    }
                                                });

                                                return 1;
                                            })
                                    )
                            )

                            .then(ClientCommandManager.literal("status")
                                    .executes(ctx -> {
                                        if (DashConfig.isConfigured()) {
                                            reply(ctx, Text.literal("● Activo")
                                                    .formatted(Formatting.GREEN)
                                                    .append(Text.literal("  API key: ").formatted(Formatting.GRAY))
                                                    .append(Text.literal(maskKey(DashConfig.getInstance().apiKey))
                                                            .formatted(Formatting.WHITE)));
                                        } else {
                                            reply(ctx, Text.literal("● Inactivo")
                                                    .formatted(Formatting.RED)
                                                    .append(Text.literal("  Usa /dash key <tu-api-key>").formatted(Formatting.GRAY)));
                                        }
                                        return 1;
                                    })
                            )

                            .then(ClientCommandManager.literal("clear")
                                    .executes(ctx -> {
                                        if (!DashConfig.isConfigured()) {
                                            reply(ctx, Text.literal("No hay ninguna API key configurada.")
                                                    .formatted(Formatting.GRAY));
                                            return 0;
                                        }

                                        DashConfig.unlink();
                                        reply(ctx, Text.literal("API key eliminada. El mod está desvinculado.")
                                                .formatted(Formatting.YELLOW));
                                        return 1;
                                    })
                            )

                            .then(ClientCommandManager.literal("nicks")
                                    .executes(ctx -> {
                                        MinecraftClient.getInstance().setScreen(new DashNicknamesScreen(null));
                                        return 1;
                                    })
                            )
            );
        });
    }

    private static void reply(CommandContext<FabricClientCommandSource> ctx, Text message) {
        ctx.getSource().sendFeedback(DashChat.message(message));
    }

    private static String maskKey(String apiKey) {
        if (apiKey == null || apiKey.length() <= 11) return "—";
        return apiKey.substring(0, 11) + "…";
    }
}

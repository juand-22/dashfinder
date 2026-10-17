package com.dash;

import net.minecraft.client.MinecraftClient;
import net.minecraft.text.Text;
import net.minecraft.util.Formatting;

/**
 * Mensajes del mod en el chat. Se puede llamar desde cualquier hilo: el mensaje
 * se encola para enviarse en el hilo del cliente.
 */
public final class DashChat {

    private DashChat() {}

    /** Texto con el prefijo `◆ Dash › ` para usar también como feedback de comandos. */
    public static Text message(Text content) {
        return Text.literal("◆ Dash")
                .formatted(Formatting.DARK_AQUA)
                .append(Text.literal(" › ").formatted(Formatting.DARK_GRAY))
                .append(content);
    }

    public static void send(Text content) {
        MinecraftClient client = MinecraftClient.getInstance();
        if (client == null) return;

        client.execute(() -> {
            if (client.inGameHud == null) return;
            client.inGameHud.getChatHud().addMessage(message(content));
        });
    }
}

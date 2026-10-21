package com.dash;

import net.minecraft.client.MinecraftClient;
import net.minecraft.text.Text;
import net.minecraft.util.Formatting;

public final class DashChat {

    private DashChat() {}

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

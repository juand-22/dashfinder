package com.dash;

import net.minecraft.client.MinecraftClient;
import net.minecraft.client.gui.screen.Screen;
import net.minecraft.client.gui.tooltip.Tooltip;
import net.minecraft.client.gui.widget.ButtonWidget;
import net.minecraft.client.gui.widget.TextWidget;
import net.minecraft.text.Text;
import net.minecraft.util.Formatting;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

public class DashNicknamesScreen extends Screen {

    private static final int ROW_HEIGHT = 24;
    private static final int ROW_WIDTH = 340;

    private final Screen parent;

    private List<String> nicknames = new ArrayList<>();
    private boolean loading = false;
    private boolean loaded = false;
    private String error = "";
    private int page = 0;

    public DashNicknamesScreen(Screen parent) {
        super(Text.literal("Dash nicknames"));
        this.parent = parent;
    }

    @Override
    protected void init() {
        if (!loaded && !loading) startLoad();

        int centerX = this.width / 2;
        int footerY = this.height - 28;
        int pagerY = this.height - 52;
        int rowsTop = 56;
        int rowsBottom = pagerY - 6;

        this.addDrawableChild(centered(20, "Dash nicknames", Formatting.BOLD));

        if (!error.isEmpty()) {
            this.addDrawableChild(centered(38, error, Formatting.RED));
        } else if (DashSession.isActive()) {
            this.addDrawableChild(centered(38, "Logueado con: " + DashSession.activeNick(), Formatting.GREEN));
        } else if (DashSession.realNick() != null) {
            this.addDrawableChild(centered(38, "Logueado con: " + DashSession.realNick(), Formatting.GRAY));
        }

        int rowsPerPage = Math.max(1, (rowsBottom - rowsTop) / ROW_HEIGHT);
        int totalPages = Math.max(1, (nicknames.size() + rowsPerPage - 1) / rowsPerPage);
        this.page = Math.min(Math.max(this.page, 0), totalPages - 1);

        if (loading) {
            this.addDrawableChild(centered(rowsTop + 8, "Cargando tus nicks...", Formatting.GRAY));
        } else if (nicknames.isEmpty() && error.isEmpty()) {
            this.addDrawableChild(centered(rowsTop + 8, "No tenés nicks guardados. Creá alguno desde el panel (Dash nicknames).", Formatting.GRAY));
        } else {
            int from = this.page * rowsPerPage;
            int to = Math.min(nicknames.size(), from + rowsPerPage);
            int rowLeft = centerX - ROW_WIDTH / 2;
            String activeNick = DashSession.activeNick();

            for (int index = from; index < to; index++) {
                String nickname = nicknames.get(index);
                int y = rowsTop + (index - from) * ROW_HEIGHT;
                boolean active = nickname.equalsIgnoreCase(activeNick);

                this.addDrawableChild(new TextWidget(rowLeft, y, ROW_WIDTH - 100, 20,
                        Text.literal(nickname).formatted(active ? Formatting.GREEN : Formatting.WHITE),
                        this.textRenderer).alignLeft());

                ButtonWidget login = ButtonWidget.builder(Text.literal(active ? "Activo" : "Login"), button -> login(nickname))
                        .dimensions(rowLeft + ROW_WIDTH - 92, y, 92, 20)
                        .build();
                login.active = !active;
                this.addDrawableChild(login);
            }
        }

        if (totalPages > 1) {
            ButtonWidget previous = ButtonWidget.builder(Text.literal("< Anterior"), button -> {
                page--;
                refresh();
            }).dimensions(centerX - 155, pagerY, 100, 20).build();
            previous.active = page > 0;
            this.addDrawableChild(previous);

            this.addDrawableChild(new TextWidget(centerX - 50, pagerY, 100, 20,
                    Text.literal("Página " + (page + 1) + " de " + totalPages).formatted(Formatting.GRAY),
                    this.textRenderer).alignCenter());

            ButtonWidget next = ButtonWidget.builder(Text.literal("Siguiente >"), button -> {
                page++;
                refresh();
            }).dimensions(centerX + 55, pagerY, 100, 20).build();
            next.active = page < totalPages - 1;
            this.addDrawableChild(next);
        }

        ButtonWidget reload = ButtonWidget.builder(Text.literal("Actualizar"), button -> {
            startLoad();
            refresh();
        }).dimensions(centerX - 155, footerY, 100, 20).build();
        reload.active = !loading;
        this.addDrawableChild(reload);

        String realNick = DashSession.realNick();
        ButtonWidget account = ButtonWidget.builder(
                        Text.literal(realNick == null ? "Mi nick real" : realNick),
                        button -> restoreRealNick())
                .dimensions(centerX - 45, footerY, 120, 20)
                .tooltip(Tooltip.of(Text.literal("Volver al nick de tu cuenta")))
                .build();
        account.active = DashSession.isActive();
        this.addDrawableChild(account);

        this.addDrawableChild(ButtonWidget.builder(Text.literal("Cerrar"), button -> close())
                .dimensions(centerX + 85, footerY, 80, 20)
                .build());
    }

    @Override
    public void close() {
        MinecraftClient client = MinecraftClient.getInstance();

        if (client != null) client.setScreen(parent);
    }

    private void login(String nickname) {
        try {
            DashSession.apply(nickname);
            DashConfig.setActiveNick(nickname);
            error = "";

            DashChat.send(Text.literal("Login como ")
                    .formatted(Formatting.GRAY)
                    .append(Text.literal(nickname).formatted(Formatting.GREEN, Formatting.BOLD))
                    .append(Text.literal(". Solo en servidores sin premium.").formatted(Formatting.GRAY)));
        } catch (Exception e) {
            DashMod.LOGGER.warn("[Dash] No se pudo aplicar el nick: " + e.getMessage());
            error = "No se pudo aplicar el nick: " + e.getMessage();
        }

        refresh();
    }

    private void restoreRealNick() {
        try {
            DashSession.restore();
            DashConfig.setActiveNick("");
            error = "";
        } catch (Exception e) {
            DashMod.LOGGER.warn("[Dash] No se pudo volver al nick real: " + e.getMessage());
            error = "No se pudo volver al nick real: " + e.getMessage();
        }

        refresh();
    }

    private void startLoad() {
        loading = true;
        error = "";

        CompletableFuture.runAsync(() -> {
            List<String> fetched = null;
            String failure = null;

            try {
                fetched = DashNicknames.fetch();
            } catch (Exception e) {
                failure = e.getMessage() == null ? "No se pudieron cargar los nicks" : e.getMessage();
            }

            final List<String> result = fetched;
            final String message = failure;
            MinecraftClient client = MinecraftClient.getInstance();

            if (client == null) return;

            client.execute(() -> {
                loading = false;
                loaded = true;

                if (result != null) {
                    nicknames = result;
                } else {
                    error = message;
                }

                refresh();
            });
        });
    }

    private void refresh() {
        MinecraftClient client = MinecraftClient.getInstance();

        if (client == null) return;

        resize(client, width, height);
    }

    private TextWidget centered(int y, String message, Formatting formatting) {
        return new TextWidget(0, y, width, 12, Text.literal(message).formatted(formatting), textRenderer).alignCenter();
    }
}

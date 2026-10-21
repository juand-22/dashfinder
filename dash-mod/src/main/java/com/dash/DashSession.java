package com.dash;

import net.minecraft.client.MinecraftClient;

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.UUID;

public final class DashSession {

    private static Object realSession = null;

    private static Object ourSession = null;

    private static String ourNick = null;

    private static String realNick = null;

    private DashSession() {}

    public static String activeNick() {
        return ourNick;
    }

    public static String realNick() {
        if (realNick != null) return realNick;

        MinecraftClient client = MinecraftClient.getInstance();

        if (client == null) return null;

        var session = client.getSession();

        return session == null ? null : session.getUsername();
    }

    public static boolean isActive() {
        return ourSession != null;
    }

    public static void apply(String nickname) throws Exception {
        MinecraftClient client = MinecraftClient.getInstance();

        if (client == null) {
            throw new IllegalStateException("Minecraft todavía no arrancó");
        }

        var current = client.getSession();

        if (current == null) {
            throw new IllegalStateException("no se pudo leer la sesión actual");
        }

        String accountNick = current.getUsername();
        Object replacement = buildSession(current.getClass(), nickname,
                current.getAccessToken(), current.getXuid(), current.getClientId(), current.getAccountType());

        setSession(client, current, replacement);

        var check = client.getSession();

        if (check == null || !nickname.equals(check.getUsername())) {
            setSession(client, replacement, current);
            throw new IllegalStateException("no se pudo cambiar la sesión del juego");
        }

        if (current != ourSession) {
            realSession = current;
            realNick = accountNick;
        }

        ourSession = replacement;
        ourNick = nickname;
    }

    public static void restore() throws Exception {
        if (realSession == null || ourSession == null) return;

        MinecraftClient client = MinecraftClient.getInstance();

        if (client == null) return;

        setSession(client, ourSession, realSession);

        realSession = null;
        ourSession = null;
        ourNick = null;
    }


    private static Object buildSession(Class<?> sessionClass, String nickname,
            Object accessToken, Object xuid, Object clientId, Object accountType) throws Exception {
        UUID uuid = offlineUuid(nickname);

        for (Constructor<?> constructor : sessionClass.getConstructors()) {
            Class<?>[] types = constructor.getParameterTypes();

            if (types.length != 6 || types[0] != String.class) continue;

            if (types[1] == String.class) {
                return constructor.newInstance(nickname, uuid.toString(), accessToken,
                        emptyIfNull(xuid), emptyIfNull(clientId), accountType);
            }

            if (types[1] == UUID.class) {
                return constructor.newInstance(nickname, uuid, accessToken,
                        emptyIfNull(xuid), emptyIfNull(clientId), accountType);
            }
        }

        throw new IllegalStateException("esta versión de Minecraft no tiene la sesión esperada");
    }

    public static UUID offlineUuid(String nickname) {
        return UUID.nameUUIDFromBytes(("OfflinePlayer:" + nickname).getBytes(StandardCharsets.UTF_8));
    }

    private static void setSession(MinecraftClient client, Object current, Object replacement) throws Exception {
        for (Field field : MinecraftClient.class.getDeclaredFields()) {
            if (field.getType() == current.getClass()) {
                field.setAccessible(true);
                field.set(client, replacement);
                return;
            }
        }

        throw new IllegalStateException("no se encontró la sesión en MinecraftClient");
    }

    private static Object emptyIfNull(Object optional) {
        return optional == null ? Optional.empty() : optional;
    }
}

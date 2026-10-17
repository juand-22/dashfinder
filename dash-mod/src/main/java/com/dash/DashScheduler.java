package com.dash;

public class DashScheduler {

    private static final long INTERVAL_MS = 10_000L; // 10 segundos

    private static long lastSentAt   = System.currentTimeMillis();
    private static Runnable sendTask = null;

    private DashScheduler() {}

    /** Registra el callback que ejecuta el envío real */
    public static void registerSendTask(Runnable task) {
        sendTask = task;
    }

    /** Llama esto al final de cada tick del cliente */
    public static void tick() {
        if (sendTask == null) return;
        if (System.currentTimeMillis() - lastSentAt >= INTERVAL_MS) {
            lastSentAt = System.currentTimeMillis();
            sendTask.run();
        }
    }

    /** Fuerza un envío inmediato y reinicia el ciclo */
    public static void sendNow() {
        if (sendTask == null) return;
        lastSentAt = System.currentTimeMillis();
        sendTask.run();
    }
}

package com.dash;

public class DashScheduler {

    private static final long INTERVAL_MS = 10_000L;

    private static long lastSentAt   = System.currentTimeMillis();
    private static Runnable sendTask = null;

    private DashScheduler() {}

    public static void registerSendTask(Runnable task) {
        sendTask = task;
    }

    public static void tick() {
        if (sendTask == null) return;
        if (System.currentTimeMillis() - lastSentAt >= INTERVAL_MS) {
            lastSentAt = System.currentTimeMillis();
            sendTask.run();
        }
    }

    public static void sendNow() {
        if (sendTask == null) return;
        lastSentAt = System.currentTimeMillis();
        sendTask.run();
    }
}

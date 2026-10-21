package com.dash.api;

import com.dash.DashConfig;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Properties;

public final class ApiClient {

    public static final String BASE_URL = loadBaseUrl();

    private static final String API_KEY_HEADER = "x-api-key";
    private static final HttpClient HTTP = HttpClient.newHttpClient();

    private ApiClient() {}

    private static String loadBaseUrl() {
        try (InputStream stream = ApiClient.class.getResourceAsStream("/dash.properties")) {
            if (stream != null) {
                Properties properties = new Properties();
                properties.load(stream);

                String url = properties.getProperty("apiUrl", "").trim();

                if (!url.isEmpty()) return url.replaceAll("/+$", "");
            }
        } catch (Exception ignored) {
        }

        return "http://localhost:3000/api";
    }

    public static HttpResponse<String> post(String path, JsonObject body) throws Exception {
        return post(path, body, DashConfig.getInstance().apiKey);
    }

    public static HttpResponse<String> post(String path, JsonObject body, String apiKey) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + path))
                .header("Content-Type", "application/json")
                .header("User-Agent", "DashClient/1.0")
                .POST(HttpRequest.BodyPublishers.ofString(body.toString()));

        if (apiKey != null && !apiKey.isBlank()) {
            request.header(API_KEY_HEADER, apiKey);
        }

        return HTTP.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }

    public static HttpResponse<String> get(String path) throws Exception {
        return get(path, DashConfig.getInstance().apiKey);
    }

    public static HttpResponse<String> get(String path, String apiKey) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + path))
                .header("User-Agent", "DashClient/1.0")
                .GET();

        if (apiKey != null && !apiKey.isBlank()) {
            request.header(API_KEY_HEADER, apiKey);
        }

        return HTTP.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }

    public static String readUsername(String responseBody) {
        try {
            JsonObject json = JsonParser.parseString(responseBody).getAsJsonObject();
            if (!json.has("username") || json.get("username").isJsonNull()) return null;
            return json.get("username").getAsString();
        } catch (Exception e) {
            return null;
        }
    }
}

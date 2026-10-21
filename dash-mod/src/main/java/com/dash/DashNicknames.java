package com.dash;

import com.dash.api.ApiClient;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;

import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;

public final class DashNicknames {

    private DashNicknames() {}

    public static List<String> fetch() throws Exception {
        HttpResponse<String> response = ApiClient.get("/mod/nicknames/mod");

        if (response.statusCode() == 401) {
            throw new IllegalStateException("La API key no es válida. Vinculá el mod con /dash key");
        }

        if (response.statusCode() != 200) {
            throw new IllegalStateException("El servidor respondió " + response.statusCode());
        }

        JsonElement body = JsonParser.parseString(response.body());

        if (!body.isJsonArray()) {
            throw new IllegalStateException("El servidor devolvió algo inesperado");
        }

        List<String> nicknames = new ArrayList<>();

        for (JsonElement element : body.getAsJsonArray()) {
            if (!element.isJsonObject()) continue;

            JsonElement nickname = element.getAsJsonObject().get("nickname");

            if (nickname != null && nickname.isJsonPrimitive()) {
                nicknames.add(nickname.getAsString());
            }
        }

        return nicknames;
    }
}

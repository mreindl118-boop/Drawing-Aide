package io.github.mreindl118.drawingaide;

import android.app.AlertDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.provider.Settings;

import androidx.core.content.FileProvider;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Self-update from GitHub Releases. CI publishes every build of the default branch as a release
 * tagged android-v{versionCode} with the signed APK attached. On launch (at most every few hours)
 * the app asks the GitHub API for the latest release; if its number is higher than this build,
 * it offers to download and install it.
 */
class Updater {
    private static final long CHECK_EVERY_MS = 3 * 60 * 60 * 1000L;

    private final MainActivity activity;
    private final SharedPreferences prefs;
    private File waitingApk;  // downloaded, waiting for "install unknown apps" permission

    Updater(MainActivity activity) {
        this.activity = activity;
        this.prefs = activity.getSharedPreferences("updater", 0);
    }

    void checkOnLaunch() {
        long last = prefs.getLong("lastCheck", 0);
        if (System.currentTimeMillis() - last > CHECK_EVERY_MS) check(false);
    }

    /** @param manual true when the user asked, so "you're up to date" is shown too. */
    void check(boolean manual) {
        new Thread(() -> {
            try {
                JSONObject rel = getJson("https://api.github.com/repos/" + BuildConfig.UPDATE_REPO + "/releases/latest");
                prefs.edit().putLong("lastCheck", System.currentTimeMillis()).apply();
                String tag = rel.optString("tag_name", "");
                int latest = tag.startsWith("android-v") ? Integer.parseInt(tag.substring(9)) : 0;
                String apkUrl = null;
                JSONArray assets = rel.optJSONArray("assets");
                for (int i = 0; assets != null && i < assets.length(); i++) {
                    JSONObject a = assets.getJSONObject(i);
                    if (a.optString("name").endsWith(".apk")) apkUrl = a.optString("browser_download_url");
                }
                if (latest > BuildConfig.VERSION_CODE && apkUrl != null) {
                    final String url = apkUrl;
                    final String notes = rel.optString("body", "").trim();
                    activity.runOnUiThread(() -> offer(latest, url, notes));
                } else if (manual) {
                    activity.toast("Drawing Aide is up to date (version " + BuildConfig.VERSION_NAME + ")");
                }
            } catch (Exception e) {
                if (manual) activity.toast("Couldn't check for updates: " + e.getMessage());
            }
        }).start();
    }

    private void offer(int version, String url, String notes) {
        if (activity.isFinishing()) return;
        String msg = "Version 0.1." + version + " is available. You have " + BuildConfig.VERSION_NAME + ".";
        if (!notes.isEmpty()) msg += "\n\n" + (notes.length() > 600 ? notes.substring(0, 600) + "…" : notes);
        new AlertDialog.Builder(activity)
                .setTitle("Update Drawing Aide")
                .setMessage(msg)
                .setPositiveButton("Update", (d, w) -> download(url))
                .setNegativeButton("Later", null)
                .show();
    }

    private void download(String url) {
        activity.toast("Downloading update…");
        new Thread(() -> {
            try {
                File dir = new File(activity.getCacheDir(), "updates");
                if (!dir.exists()) dir.mkdirs();
                File apk = new File(dir, "drawing-aide-update.apk");
                HttpURLConnection c = open(url);
                try (InputStream in = c.getInputStream(); OutputStream out = new FileOutputStream(apk)) {
                    byte[] buf = new byte[1 << 16];
                    int n;
                    while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
                } finally {
                    c.disconnect();
                }
                activity.runOnUiThread(() -> install(apk));
            } catch (Exception e) {
                activity.toast("Update download failed: " + e.getMessage());
            }
        }).start();
    }

    private void install(File apk) {
        if (!activity.getPackageManager().canRequestPackageInstalls()) {
            waitingApk = apk;
            activity.toast("Allow Drawing Aide to install updates, then come back");
            activity.startActivity(new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                    Uri.parse("package:" + activity.getPackageName())));
            return;
        }
        Uri uri = FileProvider.getUriForFile(activity, activity.getPackageName() + ".updates", apk);
        Intent i = new Intent(Intent.ACTION_VIEW);
        i.setDataAndType(uri, "application/vnd.android.package-archive");
        i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
        activity.startActivity(i);
    }

    void resumeIfWaitingForPermission() {
        if (waitingApk != null && activity.getPackageManager().canRequestPackageInstalls()) {
            File apk = waitingApk;
            waitingApk = null;
            install(apk);
        }
    }

    private static HttpURLConnection open(String url) throws java.io.IOException {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setConnectTimeout(15000);
        c.setReadTimeout(60000);
        c.setInstanceFollowRedirects(true);
        c.setRequestProperty("User-Agent", "DrawingAide-Android");
        return c;
    }

    private static JSONObject getJson(String url) throws Exception {
        HttpURLConnection c = open(url);
        c.setRequestProperty("Accept", "application/vnd.github+json");
        try (InputStream in = c.getInputStream()) {
            return new JSONObject(new String(MainActivity.readAll(in), "UTF-8"));
        } finally {
            c.disconnect();
        }
    }
}

package io.github.mreindl118.drawingaide;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;

import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewClientCompat;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * Hosts the Style Studio page (web/studio.html, bundled as an asset) in a WebView.
 * The page is served from https://appassets.androidplatform.net so canvas reads work normally.
 */
public class MainActivity extends Activity {
    private static final String START_URL = "https://appassets.androidplatform.net/assets/studio.html";
    private static final int PICK_PHOTO = 1;

    private WebView web;
    private ValueCallback<Uri[]> pendingChooser;
    private Updater updater;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        buildWebView(state);
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q
                && checkSelfPermission(android.Manifest.permission.WRITE_EXTERNAL_STORAGE)
                != android.content.pm.PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{android.Manifest.permission.WRITE_EXTERNAL_STORAGE}, 2);
        }

        updater = new Updater(this);
        updater.checkOnLaunch();
        handleShare(getIntent());
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void buildWebView(Bundle state) {
        web = new WebView(this);
        setContentView(web);

        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();
        web.setWebViewClient(new WebViewClientCompat() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return loader.shouldInterceptRequest(request.getUrl());
            }

            /* If Android kills the page's renderer (usually for memory), rebuild the page
               instead of letting the whole app crash. */
            @Override
            public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                if (view != web) return true;
                buildWebView(null);   // replaces the dead view on screen
                view.destroy();
                toast("That painting ran out of memory, so the studio restarted. Try a larger block size.");
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback,
                                             FileChooserParams params) {
                if (pendingChooser != null) pendingChooser.onReceiveValue(null);
                pendingChooser = callback;
                Intent pick = new Intent(Intent.ACTION_GET_CONTENT);
                pick.addCategory(Intent.CATEGORY_OPENABLE);
                pick.setType("image/*");
                try {
                    startActivityForResult(Intent.createChooser(pick, "Choose a photo"), PICK_PHOTO);
                } catch (Exception e) {
                    pendingChooser = null;
                    return false;
                }
                return true;
            }
        });

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);
        web.addJavascriptInterface(new Bridge(), "Android");

        if (state != null) web.restoreState(state);
        else web.loadUrl(START_URL);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleShare(intent);
    }

    /** A photo shared from another app: pass it to the page as a data URL once it has loaded. */
    private void handleShare(Intent intent) {
        if (intent == null || !Intent.ACTION_SEND.equals(intent.getAction())) return;
        Uri uri = intent.getParcelableExtra(Intent.EXTRA_STREAM);
        if (uri == null) return;
        new Thread(() -> {
            try (InputStream in = getContentResolver().openInputStream(uri)) {
                byte[] bytes = readAll(in);
                String type = getContentResolver().getType(uri);
                String data = "data:" + (type != null ? type : "image/jpeg") + ";base64,"
                        + Base64.encodeToString(bytes, Base64.NO_WRAP);
                String js = "(function f(){if(window.loadSharedPhoto){loadSharedPhoto('" + data
                        + "','Shared photo')}else{setTimeout(f,200)}})()";
                runOnUiThread(() -> web.evaluateJavascript(js, null));
            } catch (Exception e) {
                toast("Could not open that photo");
            }
        }).start();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == PICK_PHOTO && pendingChooser != null) {
            pendingChooser.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode, data));
            pendingChooser = null;
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (updater != null) updater.resumeIfWaitingForPermission();
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    void toast(String msg) {
        runOnUiThread(() -> Toast.makeText(this, msg, Toast.LENGTH_LONG).show());
    }

    static byte[] readAll(InputStream in) throws java.io.IOException {
        java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
        byte[] buf = new byte[1 << 16];
        int n;
        while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
        return out.toByteArray();
    }

    /** Methods the page can call as window.Android.* */
    private class Bridge {
        @JavascriptInterface
        public String version() {
            return BuildConfig.VERSION_NAME;
        }

        @JavascriptInterface
        public void checkForUpdate() {
            runOnUiThread(() -> updater.check(true));
        }

        /** Save a data: URL image to Pictures/Drawing Aide. */
        @JavascriptInterface
        public void saveImage(String dataUrl, String baseName) {
            new Thread(() -> {
                try {
                    int comma = dataUrl.indexOf(',');
                    byte[] bytes = Base64.decode(dataUrl.substring(comma + 1), Base64.DEFAULT);
                    String mime = dataUrl.startsWith("data:image/png") ? "image/png" : "image/jpeg";
                    String ext = mime.equals("image/png") ? ".png" : ".jpg";
                    String stamp = new SimpleDateFormat("yyyyMMdd-HHmmss", Locale.US).format(new Date());
                    String name = (baseName == null || baseName.isEmpty() ? "painting" : baseName) + "-" + stamp + ext;
                    writePicture(bytes, name, mime);
                    toast("Saved to Pictures/Drawing Aide");
                } catch (Exception e) {
                    toast("Could not save: " + e.getMessage());
                }
            }).start();
        }
    }

    private void writePicture(byte[] bytes, String name, String mime) throws java.io.IOException {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ContentValues v = new ContentValues();
            v.put(MediaStore.Images.Media.DISPLAY_NAME, name);
            v.put(MediaStore.Images.Media.MIME_TYPE, mime);
            v.put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/Drawing Aide");
            Uri uri = getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, v);
            if (uri == null) throw new java.io.IOException("no media store");
            try (OutputStream out = getContentResolver().openOutputStream(uri)) {
                out.write(bytes);
            }
        } else {
            File dir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES), "Drawing Aide");
            if (!dir.exists() && !dir.mkdirs()) throw new java.io.IOException("cannot create folder");
            try (OutputStream out = new FileOutputStream(new File(dir, name))) {
                out.write(bytes);
            }
        }
    }
}

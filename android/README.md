# Drawing Aide for Android

A small Android app that runs the Style Studio (`web/studio.html`) on your phone and keeps itself
up to date.

- Pick a photo from the gallery, or share one into Drawing Aide from any app.
- **Save painting** stores the result in `Pictures/Drawing Aide`.
- On launch (at most every 3 hours), and from **Check for updates**, the app asks GitHub for the latest
  release. If there is a newer one, it offers to download and install it.

## How releases happen

`.github/workflows/android.yml` builds the APK on every push.

- On the default branch it signs the APK with the release key and publishes a GitHub Release
  tagged `android-v<run number>` with the APK attached. That release is what installed apps update to.
- On other branches it builds a test APK (signed with a throwaway debug key) and attaches it to the
  workflow run as an artifact. Don't install those over the real app: Android rejects an update signed
  with a different key.

## One-time setup: the signing key

Android only installs an update if it is signed with the same key as the installed app, so the key
lives in two repository secrets (Settings → Secrets and variables → Actions → New repository secret):

| Secret | Value |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | the keystore file, base64-encoded |
| `ANDROID_KEYSTORE_PASSWORD` | its password (used for both the store and the key) |

The key alias is `drawingaide` (override with an `ANDROID_KEY_ALIAS` env var if you make your own).
To make a new key yourself:

```
keytool -genkeypair -keystore drawing-aide.jks -alias drawingaide -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 drawing-aide.jks   # paste the output into ANDROID_KEYSTORE_BASE64
```

Keep a copy of the keystore somewhere safe. If it is lost, the next release needs a new key and the
app has to be uninstalled and reinstalled once.

## First install on the phone

1. Open the latest release: https://github.com/mreindl118-boop/Drawing-Aide/releases/latest
2. Download the `.apk` and open it. Android asks once to allow installs from your browser.
3. After that, updates come through the app itself (it asks once to allow installs from Drawing Aide).

## Building locally

Needs JDK 17 and the Android SDK (platform 35).

```
gradle -p android assembleRelease      # signed with the debug key unless ANDROID_KEYSTORE_PATH is set
```

plugins { id("com.android.application") }

// CI passes the workflow run number so every published APK has a higher version than the last.
val buildNumber = (System.getenv("VERSION_CODE") ?: "1").toInt()
// Release signing comes from GitHub Actions secrets (see android/README.md). The same key must sign
// every release, or Android refuses to install the update over the existing app.
val keystorePath: String? = System.getenv("ANDROID_KEYSTORE_PATH")

android {
    namespace = "io.github.mreindl118.drawingaide"
    compileSdk = 35

    defaultConfig {
        applicationId = "io.github.mreindl118.drawingaide"
        minSdk = 26
        targetSdk = 35
        versionCode = buildNumber
        versionName = "0.1.$buildNumber"
        buildConfigField("String", "UPDATE_REPO", "\"mreindl118-boop/Drawing-Aide\"")
    }

    signingConfigs {
        if (keystorePath != null) {
            create("release") {
                storeFile = file(keystorePath)
                storePassword = System.getenv("ANDROID_KEYSTORE_PASSWORD")
                keyAlias = System.getenv("ANDROID_KEY_ALIAS") ?: "drawingaide"
                keyPassword = System.getenv("ANDROID_KEYSTORE_PASSWORD")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = if (keystorePath != null) signingConfigs.getByName("release")
                            else signingConfigs.getByName("debug")
        }
    }

    buildFeatures { buildConfig = true }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    // The studio page lives in ../../web so the browser and app versions stay identical.
    sourceSets["main"].assets.srcDirs("src/main/assets", "../../web")
}

dependencies {
    implementation("androidx.core:core:1.13.1")
    implementation("androidx.webkit:webkit:1.12.1")
}

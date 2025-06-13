# Instructions pour créer un Bundle Release Android

## Prérequis

1. **Android Studio** installé avec les SDK Android appropriés
2. **Node.js** et **npm** installés
3. **Expo CLI** installé globalement : `npm install -g @expo/cli`
4. **EAS CLI** installé globalement : `npm install -g eas-cli`

## Étapes pour créer le Bundle Release

### Option 1: Utilisation d'EAS Build (Recommandé)

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Se connecter à Expo**
   ```bash
   eas login
   ```

3. **Configurer le projet**
   ```bash
   eas build:configure
   ```

4. **Créer le bundle de production**
   ```bash
   eas build --platform android --profile production
   ```

   Ou pour créer un APK au lieu d'un AAB :
   ```bash
   eas build --platform android --profile production-apk
   ```

### Option 2: Build local avec Expo

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Préparer le projet pour Android**
   ```bash
   npx expo prebuild --platform android
   ```

3. **Ouvrir le projet dans Android Studio**
   - Ouvrir Android Studio
   - Sélectionner "Open an existing Android Studio project"
   - Naviguer vers le dossier `android/` dans votre projet
   - Ouvrir le projet

4. **Configurer la signature de l'application**
   - Dans Android Studio, aller à `Build > Generate Signed Bundle / APK`
   - Sélectionner "Android App Bundle"
   - Créer ou utiliser un keystore existant
   - Remplir les informations de signature

5. **Créer le bundle release**
   - Aller à `Build > Build Bundle(s) / APK(s) > Build Bundle(s)`
   - Ou utiliser le terminal dans Android Studio :
     ```bash
     ./gradlew bundleRelease
     ```

### Option 3: Build via ligne de commande

1. **Préparer l'environnement**
   ```bash
   npm install
   npx expo prebuild --platform android
   ```

2. **Naviguer vers le dossier Android**
   ```bash
   cd android
   ```

3. **Créer le bundle release**
   ```bash
   ./gradlew bundleRelease
   ```

4. **Le fichier AAB sera généré dans :**
   ```
   android/app/build/outputs/bundle/release/app-release.aab
   ```

## Configuration de signature (pour builds locaux)

### Créer un keystore

```bash
keytool -genkey -v -keystore receipt-scanner-release-key.keystore -alias receipt-scanner -keyalg RSA -keysize 2048 -validity 10000
```

### Configurer gradle.properties

Créer ou modifier `android/gradle.properties` :

```properties
MYAPP_RELEASE_STORE_FILE=receipt-scanner-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=receipt-scanner
MYAPP_RELEASE_STORE_PASSWORD=votre_mot_de_passe_keystore
MYAPP_RELEASE_KEY_PASSWORD=votre_mot_de_passe_cle
```

### Configurer build.gradle

Dans `android/app/build.gradle`, ajouter la configuration de signature :

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            ...
            signingConfig signingConfigs.release
        }
    }
}
```

## Variables d'environnement

Assurez-vous de configurer vos variables d'environnement :

```bash
# .env
EXPO_PUBLIC_OPENAI_API_KEY=votre_cle_openai
EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY=votre_cle_google_cloud
```

## Vérification du bundle

Après la création du bundle, vous pouvez le tester avec :

```bash
# Installer bundletool
# Télécharger depuis : https://github.com/google/bundletool/releases

# Générer un APK à partir du bundle pour test
java -jar bundletool.jar build-apks --bundle=app-release.aab --output=app-release.apks

# Installer sur un appareil connecté
java -jar bundletool.jar install-apks --apks=app-release.apks
```

## Troubleshooting

### Erreurs communes

1. **Gradle build failed**
   - Vérifier que Java 11+ est installé
   - Nettoyer le cache : `cd android && ./gradlew clean`

2. **Signature errors**
   - Vérifier les chemins et mots de passe dans gradle.properties
   - S'assurer que le keystore existe

3. **Dépendances manquantes**
   - Exécuter `npm install` dans le dossier racine
   - Synchroniser le projet dans Android Studio

### Commandes utiles

```bash
# Nettoyer le cache Expo
npx expo r -c

# Nettoyer le cache Metro
npx expo r -c

# Nettoyer Gradle
cd android && ./gradlew clean

# Vérifier la configuration
npx expo doctor
```

## Déploiement

Une fois le bundle créé, vous pouvez :

1. **Google Play Store** : Uploader le fichier `.aab`
2. **Test interne** : Distribuer via Google Play Console
3. **Sideloading** : Convertir en APK et installer directement

Le fichier bundle sera optimisé pour la distribution et permettra à Google Play de générer des APKs optimisés pour chaque appareil.
@echo off
setlocal enabledelayedexpansion

echo 🚀 Début de la création du bundle Android...

REM Vérifier que Node.js est installé
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js n'est pas installé. Veuillez l'installer d'abord.
    exit /b 1
)

REM Vérifier que npm est installé
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm n'est pas installé. Veuillez l'installer d'abord.
    exit /b 1
)

REM Installer les dépendances
echo 📦 Installation des dépendances...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Échec de l'installation des dépendances
    exit /b 1
)

REM Vérifier si Expo CLI est installé
where expo >nul 2>nul
if %errorlevel% neq 0 (
    echo 📱 Installation d'Expo CLI...
    call npm install -g @expo/cli
)

REM Nettoyer le cache
echo 🧹 Nettoyage du cache...
call npx expo r -c

REM Préparer le projet pour Android
echo 🔧 Préparation du projet Android...
call npx expo prebuild --platform android --clean
if %errorlevel% neq 0 (
    echo ❌ Échec de la préparation du projet Android
    exit /b 1
)

REM Vérifier si le dossier android existe
if not exist "android" (
    echo ❌ Le dossier android n'a pas été créé. Vérifiez la configuration.
    exit /b 1
)

REM Naviguer vers le dossier Android
cd android

REM Nettoyer le projet Gradle
echo 🧹 Nettoyage du projet Gradle...
call gradlew.bat clean
if %errorlevel% neq 0 (
    echo ❌ Échec du nettoyage Gradle
    exit /b 1
)

REM Créer le bundle release
echo 🏗️ Création du bundle release...
call gradlew.bat bundleRelease
if %errorlevel% neq 0 (
    echo ❌ Échec de la création du bundle
    exit /b 1
)

REM Vérifier si le bundle a été créé
if exist "app\build\outputs\bundle\release\app-release.aab" (
    echo ✅ Bundle créé avec succès !
    echo 📍 Emplacement : android\app\build\outputs\bundle\release\app-release.aab
    
    REM Copier le bundle vers le dossier racine
    copy "app\build\outputs\bundle\release\app-release.aab" "..\receipt-scanner-release.aab"
    echo 📋 Bundle copié vers : receipt-scanner-release.aab
    
) else (
    echo ❌ Échec de la création du bundle. Vérifiez les logs ci-dessus.
    exit /b 1
)

echo 🎉 Build terminé avec succès !
echo.
echo Prochaines étapes :
echo 1. Testez le bundle avec bundletool
echo 2. Uploadez sur Google Play Console
echo 3. Configurez la signature de l'application si nécessaire

cd ..
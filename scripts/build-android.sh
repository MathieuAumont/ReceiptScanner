#!/bin/bash

# Script pour automatiser la création du bundle Android
set -e

echo "🚀 Début de la création du bundle Android..."

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier que npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# Vérifier si Expo CLI est installé
if ! command -v expo &> /dev/null; then
    echo "📱 Installation d'Expo CLI..."
    npm install -g @expo/cli
fi

# Nettoyer le cache
echo "🧹 Nettoyage du cache..."
npx expo r -c

# Préparer le projet pour Android
echo "🔧 Préparation du projet Android..."
npx expo prebuild --platform android --clean

# Vérifier si le dossier android existe
if [ ! -d "android" ]; then
    echo "❌ Le dossier android n'a pas été créé. Vérifiez la configuration."
    exit 1
fi

# Naviguer vers le dossier Android
cd android

# Donner les permissions d'exécution à gradlew
chmod +x ./gradlew

# Nettoyer le projet Gradle
echo "🧹 Nettoyage du projet Gradle..."
./gradlew clean

# Créer le bundle release
echo "🏗️ Création du bundle release..."
./gradlew bundleRelease

# Vérifier si le bundle a été créé
if [ -f "app/build/outputs/bundle/release/app-release.aab" ]; then
    echo "✅ Bundle créé avec succès !"
    echo "📍 Emplacement : android/app/build/outputs/bundle/release/app-release.aab"
    
    # Afficher la taille du fichier
    size=$(du -h app/build/outputs/bundle/release/app-release.aab | cut -f1)
    echo "📏 Taille du bundle : $size"
    
    # Copier le bundle vers le dossier racine pour faciliter l'accès
    cp app/build/outputs/bundle/release/app-release.aab ../receipt-scanner-release.aab
    echo "📋 Bundle copié vers : receipt-scanner-release.aab"
    
else
    echo "❌ Échec de la création du bundle. Vérifiez les logs ci-dessus."
    exit 1
fi

echo "🎉 Build terminé avec succès !"
echo ""
echo "Prochaines étapes :"
echo "1. Testez le bundle avec bundletool"
echo "2. Uploadez sur Google Play Console"
echo "3. Configurez la signature de l'application si nécessaire"
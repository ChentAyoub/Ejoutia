# E-Joutia : Messagerie Instantanée Intégrée (Projet 5) 🇲🇦

Bienvenue sur le dépôt du **Projet 5** de l'application E-Joutia. Ce module constitue le cœur de la communication entre les vendeurs et les acheteurs de la plateforme de seconde main. Développé en React Native et Expo, il inclut une interface de chat complète et un système de négociation d'offres en temps réel propulsé par Firebase Firestore.

## 🚀 Fonctionnalités Principales

- **Boîte de réception dynamique (Facebook Marketplace style)** : Liste des conversations avec indicateurs "Non lu", points de statut en ligne, et aperçus des messages (précédés de "Vous:" si expédiés par l'utilisateur).
- **Messagerie en temps réel** : Synchronisation instantanée des messages entre les utilisateurs via `onSnapshot` de Firestore.
- **Module de Négociation** :
  - **Faire une offre** via un bouton dédié.
  - Cartes d'offres interactives dans la conversation.
  - Boutons de décision : **Accepter**, **Refuser**, **Contre-offre**.
- **Améliorations UX / Premium** :
  - Thème sombre ("Nuit Marocaine" avec accent orange `#ff6f00`).
  - Clavier d'émojis 100% natif personnalisé.
  - Simulation de notes vocales (style iMessage).
  - Puces de réponses rapides dynamiques (*Quick Replies*).
  - Animation de célébration (Confettis) lors de l'acceptation d'une offre.
- **Générateur de données (Seed)** : Un bouton dédié pour générer 10 conversations réalistes avec de véritables photos (Unsplash) et avatars (pravatar.cc) afin de tester l'interface rapidement.

## 🛠 Tech Stack

- **Framework :** React Native avec Expo (Expo Router)
- **Langage :** TypeScript
- **Base de données :** Firebase Firestore (NoSQL, Real-time)
- **Librairies tierces :** 
  - `react-native-confetti-cannon` (Animations)
  - `expo-linear-gradient` (Dégradés)

## 📥 Installation & Exécution

1. **Cloner le projet**
   ```bash
   git clone https://github.com/votre-utilisateur/e-joutia.git
   cd e-joutia
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Lancer le serveur de développement Expo**
   ```bash
   npx expo start --clear
   ```
   > Scannez le QR code avec l'application **Expo Go** sur votre téléphone (iOS/Android) ou appuyez sur `a` pour ouvrir l'émulateur Android, ou `i` pour le simulateur iOS.

## 🔥 Note sur la configuration Firebase

Le projet requiert une base de données Firebase Firestore active. Assurez-vous que le fichier `src/firebaseConfig.ts` contient les bons identifiants de votre projet Firebase. La base de données nécessite au minimum les collections `users`, `listings`, `conversations` et `messages`.

## 🧪 Comment générer les données de test (Seed)

Pour voir le design en action sans avoir à créer manuellement des dizaines d'utilisateurs et de messages :
1. Lancez l'application.
2. Naviguez vers l'écran de **Seed** (par exemple en ajoutant un bouton ou en allant sur l'onglet correspondant si configuré).
3. Cliquez sur le bouton **"Remplir avec des données de test"**.
4. L'application générera instantanément 10 conversations avec différents statuts (Non lus, Offres en cours, Notes vocales). Rendez-vous ensuite dans la boîte de réception ("Messages") pour admirer le résultat.

---

## 📸 Captures d'écran




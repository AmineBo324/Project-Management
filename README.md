🚀 Aperçu du Projet
Backend d'une application de gestion de projets avec système d'authentification, gestion des espaces de travail, projets, tâches et commentaires.

🏗️ Architecture du Projet
text
server/
├── configs/              # Configurations
│   ├── nodemailer.js    # Configuration email
│   └── prisma.config.ts # Configuration Prisma
├── controllers/         # Contrôleurs
│   ├── commentController.js
│   ├── projectController.js
│   ├── taskController.js
│   └── workspaceController.js
├── middleware/          # Middlewares
│   └── authMiddleware.js # Middleware d'authentification
├── prisma/             # Configuration Prisma ORM
│   └── schema.prisma   # Schéma de base de données
├── routes/             # Routes API
│   ├── commentRoutes.js
│   ├── projectRoutes.js
│   ├── taskRoutes.js
│   └── workspaceRoutes.js
├── index.js           # Point d'entrée principal
├── server.js          # Configuration du serveur
├── package.json       # Dépendances
├── package-lock.json  # Verrouillage des dépendances
└── vercel.json        # Configuration Vercel
🛠️ Technologies Utilisées
Node.js - Environnement d'exécution

Express.js - Framework web

Prisma - ORM pour la base de données

JWT - Authentification par token

Nodemailer - Service d'envoi d'emails

Vercel - Plateforme de déploiement

📦 Installation
1. Prérequis
Node.js (v14 ou supérieur)

npm ou yarn

Base de données (PostgreSQL recommandée)

2. Installation des dépendances
bash
npm install
3. Configuration de l'environnement
Créez un fichier .env à la racine du projet :
4. Configuration de la base de données
bash
# Générer les migrations Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev
🚀 Démarrage
Mode développement
bash
npm run dev
Mode production
bash
npm start
Le serveur démarre sur http://localhost:5000 par défaut.

🔐 Authentification
Toutes les routes (sauf register/login) nécessitent un token JWT dans le header :

text
Authorization: Bearer <votre_token_jwt>
🗄️ Base de Données
Le projet utilise Prisma avec PostgreSQL. Le schéma est défini dans prisma/schema.prisma.

Structure principale :
Users - Utilisateurs de l'application

Workspaces - Espaces de travail

Projects - Projets au sein des espaces

Tasks - Tâches au sein des projets

Comments - Commentaires sur les tâches

🚢 Déploiement
Sur Vercel
bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
Variables d'environnement sur Vercel
Configurez les mêmes variables que dans .env dans le dashboard Vercel.

🤝 Contribution
Fork le projet

Créez une branche (git checkout -b feature/AmazingFeature)

Committez vos changements (git commit -m 'Add some AmazingFeature')

Push vers la branche (git push origin feature/AmazingFeature)

Ouvrez une Pull Request

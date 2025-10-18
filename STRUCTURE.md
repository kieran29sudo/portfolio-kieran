# 📁 Structure du Projet Portfolio

## 🏗️ Arborescence

```
Portfolio/
├── 📂 src/                          # Code source backend
│   ├── 📂 config/                   # Configuration
│   │   ├── database.js              # Configuration SQLite
│   │   └── multer.js                # Configuration upload images
│   ├── 📂 routes/                   # Routes (à venir)
│   ├── 📂 controllers/              # Contrôleurs (à venir)
│   └── 📂 models/                   # Modèles (à venir)
│
├── 📂 views/                        # Templates EJS
│   ├── 📂 pages/                    # Pages principales
│   │   ├── index.ejs                # Page d'accueil
│   │   ├── catalogue.ejs            # Catalogue projets
│   │   ├── projet.ejs               # Page projet détaillée
│   │   ├── admin-projets.ejs        # Admin projets
│   │   └── 404.ejs                  # Page erreur
│   └── 📂 partials/                 # Composants réutilisables
│       ├── header.ejs               # En-tête
│       ├── footer.ejs               # Pied de page
│       └── 📂 sections/             # Sections homepage
│           ├── apropos.ejs
│           ├── formations.ejs
│           ├── experiences.ejs
│           ├── projets.ejs
│           ├── competences.ejs
│           └── interets.ejs
│
├── 📂 public/                       # Fichiers statiques
│   ├── 📂 css/                      # Styles
│   │   ├── style.css
│   │   └── buttons.css
│   ├── 📂 js/                       # Scripts (vide pour l'instant)
│   └── 📂 img/                      # Images
│       ├── 📂 projets/              # Images des projets
│       ├── 📂 competences/          # Logos compétences
│       └── 📂 travail/              # Images expériences
│
├── 📂 data/                         # Données
│   └── portfolio.db                 # Base de données SQLite
│
├── 📄 server.js                     # Serveur Express principal
├── 📄 package.json                  # Dépendances npm
├── 📄 .gitignore                    # Fichiers ignorés par Git
└── 📄 README.md                     # Documentation

```

## 🎯 Conventions

### Chemins des includes EJS

**Dans les pages** (`views/pages/*.ejs`) :
```ejs
<%- include('../partials/header') %>
<%- include('../partials/sections/apropos') %>
<%- include('../partials/footer') %>
```

### Imports JavaScript

**Dans server.js** :
```javascript
import { db, db_functions } from './src/config/database.js';
import upload from './src/config/multer.js';
```

### Configuration EJS

```javascript
app.set('view engine', 'ejs');
app.set('views', './views/pages');
```

## 🚀 Démarrage

```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`

## 📋 Routes disponibles

- `GET /` - Page d'accueil
- `GET /catalogue` - Catalogue des projets
- `GET /projet/:id` - Page projet détaillée
- `GET /admin/projets` - Administration des projets
- `POST /api/upload-image` - Upload d'image
- `POST /api/projets` - Créer un projet
- `PUT /api/projets/:id` - Modifier un projet
- `DELETE /api/projets/:id` - Supprimer un projet

## 🎨 Stack Technique

- **Backend** : Node.js + Express
- **Template Engine** : EJS
- **Base de données** : SQLite3
- **Upload** : Multer
- **Crop d'images** : Cropper.js
- **Frontend** : HTML/CSS/JavaScript vanilla

## 📦 Dépendances

```json
{
  "express": "^4.18.2",
  "ejs": "^3.1.9",
  "sqlite3": "^5.1.6",
  "multer": "^1.4.5-lts.1",
  "bcrypt": "^5.1.1"
}
```

## 🔧 Améliorations futures

- [ ] Séparer les routes dans `src/routes/`
- [ ] Créer des contrôleurs dans `src/controllers/`
- [ ] Ajouter un système d'authentification complet
- [ ] Créer un layout principal réutilisable
- [ ] Ajouter des tests unitaires
- [ ] Optimiser les images (compression, WebP)
- [ ] Ajouter un système de cache

import express from "express";
import { getDB } from '../src/config/db.js';
import upload from '../src/config/multer.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const app = express();
let db_functions;

// Initialiser la base de données au démarrage
async function initDB() {
  console.log('🔄 Initialisation de la base de données...');
  const { db_functions: dbFuncs, initDatabase } = await getDB();
  db_functions = dbFuncs;
  await initDatabase();
  console.log('✅ Base de données initialisée');
}

// Lancer l'initialisation
initDB().catch(err => {
  console.error('❌ Erreur lors de l\'initialisation:', err);
});

// Middleware pour parser les données
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Servir tous les fichiers statiques depuis le dossier public
app.use(express.static(path.join(rootDir, 'public')));

// EJS Template Engine
app.set('view engine', 'ejs');
app.set('views', path.join(rootDir, 'views', 'pages'));
// Configurer le root pour les includes EJS
app.locals.basedir = path.join(rootDir, 'views');

// Route de migration pour ajouter la colonne statut (à exécuter une seule fois)
app.get("/migrate-statut", async function (req, res) {
  try {
    if (isVercel) {
      // Migration Postgres
      await sql`ALTER TABLE projets ADD COLUMN IF NOT EXISTS statut TEXT DEFAULT 'Terminé'`;
      res.send('✅ Migration Postgres réussie : colonne statut ajoutée !');
    } else {
      // Migration SQLite
      db.run(`ALTER TABLE projets ADD COLUMN statut TEXT DEFAULT 'Terminé'`, (err) => {
        if (err) {
          if (err.message.includes('duplicate column')) {
            res.send('✅ Migration SQLite : colonne statut existe déjà !');
          } else {
            res.status(500).send('❌ Erreur migration SQLite : ' + err.message);
          }
        } else {
          res.send('✅ Migration SQLite réussie : colonne statut ajoutée !');
        }
      });
    }
  } catch (error) {
    if (error.message && error.message.includes('already exists')) {
      res.send('✅ Migration : colonne statut existe déjà !');
    } else {
      res.status(500).send('❌ Erreur migration : ' + error.message);
    }
  }
});

// Route principale - Portfolio
app.get("/", async function (req, res) {
  // Récupérer les projets depuis la base de données
  const { error: err, rows: projetsDB } = await db_functions.getAllProjets();
    const portfolio = {
    bio: {
      nom: "Le Troadec Kiéran",
      titre: "Recherche d'alternance en communication",
      description: "Je suis Kiéran Le Troadec. J'ai 19 ans, petit mais grand passionné de voitures et de motos. Consciencieux dans l'écologie et intéressé par l'audiovisuel depuis toujours, je mélange passions et engagement afin d'évoluer au quotidien. Maintenant étudiant en BUT MMI à Lannion, je suis formé dans le multimédia, ce qui me permet de développer mes capacités en montage vidéo et production visuelle. Donc, pour une alternance suscitant mes capacités et engageant mes passions, j'espère pouvoir vous aider.",
      contact: {
        adresse: "5B place du marchallach\n10 rue de Guipry",
        telephone: "07 69 84 75 60",
        permis: "B / AM véhiculé"
      }
    },
    softSkills: [
      { nom: "Curiosité", icon: "🔍" },
      { nom: "Autonomie", icon: "👤" },
      { nom: "Adaptabilité", icon: "⚙️" },
      { nom: "Créativité", icon: "✏️" },
      { nom: "Esprit d'équipe", icon: "🤝" }
    ],
    hardSkills: {
      branding: [
        "Rapport d'audit",
        "Stratégie de positionnement",
        "Identité visuelle"
      ],
      audiovisuel: [
        "Captation photo et vidéo",
        "Création numérique (suites Affinity et Adobe)",
        "Montage (Da Vinci Resolve)"
      ],
      uxDesign: [
        "Analyse des besoins/objectifs",
        "Wireframe/mockup",
        "Tests utilisateur"
      ],
      langues: [
        { langue: "Anglais", niveau: "Niveau B1: compréhension et expression", detail: "Voyage en Irlande" },
        { langue: "Espagnol", niveau: "Niveau A2", detail: "Séjour en Espagne" }
      ],
      hardSkillsIcons: [
        { nom: "HTML", logo: "/img/competences/html.png" },
        { nom: "CSS", logo: "/img/competences/css.png" },
        { nom: "JavaScript", logo: "/img/competences/js.png" },
        { nom: "Figma", logo: "/img/competences/figma.png" },
        { nom: "Affinity", logo: "/img/competences/affinity.png" }
      ]
    },
    formations: [
      {
        annees: "2024-2027",
        titre: "Bachelor Universitaire de Technologie MMI",
        details: "métiers du multimédia et de l'internet",
        lieu: "IUT, Lannion (22)",
        specialites: "Marketing et communication, production audiovisuelle et graphique, développement web"
      },
      {
        annees: "2021-2024",
        titre: "Baccalauréat STI2D",
        details: "sciences et technologies de l'industrie et du développement durable",
        lieu: "Lycée Vauban, Brest (29), Mention Bien",
        specialites: "Spécialité ITEC (Innovation Technologique et Éco-conception)"
      }
    ],
    experiences: [
      {
        titre: "Équipier polyvalent - McDonald's Lannion",
        periode: "Depuis 2024",
        image: "/img/travail/mcdo.png"
      },
      {
        titre: "Architecte d'intérieur - Edifix Brest",
        periode: "2021",
        image: "/img/travail/edifix.jpg"
      },
      {
        titre: "Agent de bibliothèque - Médiathèque l'Awena Guipavas",
        periode: "2021",
        image: "/img/travail/awena.jpg"
      }
    ],
    projets: projetsDB || [],
    interets: [
      {
        titre: "Musculation",
        description: "Engagé depuis 2 ans, ce sport me permet de 'méditer' sur moi-même."
      },
      {
        titre: "Vieilles mécaniques",
        description: "Rénovation complète d'une mobylette (103 Vogue de 1988)."
      }
    ]
  };

    res.render("index", { portfolio, projets: projetsDB || [], page: 'home' });
});

// Page catalogue
app.get("/catalogue", async function (req, res) {
  const { error: err, rows: projets } = await db_functions.getAllProjets();
  if (err) {
    console.error(' Erreur lors de la récupération des projets:', err);
    res.render("catalogue", { projets: [], page: 'catalogue' });
  } else {
    res.render("catalogue", { projets, page: 'catalogue' });
  }
});

// Page projet individuel
app.get("/projet/:id", async function (req, res) {
  const { id } = req.params;
  
  // Récupérer le projet spécifique
  const { error: err, row: projet } = await db_functions.getProjetById(id);
  if (err || !projet) {
    console.error(' Erreur lors de la récupération du projet:', err);
    return res.status(404).render('404');
  }
  
  // Récupérer tous les projets pour les projets similaires
  const { rows: tousLesProjets } = await db_functions.getAllProjets();
  // Filtrer pour exclure le projet actuel et limiter à 3
  const projetsSimilaires = (tousLesProjets || [])
    .filter(p => p.id !== parseInt(id))
    .slice(0, 3);
  
  res.render('projet', { 
    projet,
    projetsSimilaires,
    pageTitle: projet.titre
  });
});

// Page admin projets
app.get("/admin/projets", async function (req, res) {
  const { error: err, rows: projets } = await db_functions.getAllProjets();
  if (err) {
    console.error('❌ Erreur lors de la récupération des projets:', err);
    res.render("admin-projets", { projets: [] });
  } else {
    res.render("admin-projets", { projets });
  }
});

// API Routes pour la gestion des projets
// Upload d'image - Converti en base64 pour compatibilité Vercel
app.post("/api/upload-image", (req, res) => {
  upload.single('image')(req, res, function (err) {
    if (err) {
      console.error('❌ Erreur Multer:', err);
      return res.status(400).json({ error: err.message || 'Erreur lors de l\'upload' });
    }
    
    if (!req.file) {
      console.error('❌ Aucun fichier reçu');
      return res.status(400).json({ error: 'Aucune image uploadée' });
    }
    
    // Convertir l'image en base64
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    console.log('✅ Image uploadée et convertie en base64');
    res.json({ success: true, imagePath: base64Image });
  });
});

// Ajouter un projet
app.post("/api/projets", async function (req, res) {
  const { annee, titre, description, competences, image, statut } = req.body;
  
  if (!annee || !titre || !description || !competences) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  const { error: err, id } = await db_functions.addProjet({ annee, titre, description, competences, image, statut });
  if (err) {
    console.error('❌ Erreur lors de l\'ajout du projet:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
  res.json({ success: true, id });
});

// Modifier un projet
app.put("/api/projets/:id", async function (req, res) {
  const { id } = req.params;
  const { annee, titre, description, competences, image, statut } = req.body;
  
  if (!annee || !titre || !description || !competences) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  const { error: err } = await db_functions.updateProjet(id, { annee, titre, description, competences, image, statut });
  if (err) {
    console.error('❌ Erreur lors de la modification du projet:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
  res.json({ success: true });
});

// Supprimer un projet
app.delete("/api/projets/:id", async function (req, res) {
  const { id } = req.params;
  
  const { error: err } = await db_functions.deleteProjet(id);
  if (err) {
    console.error('❌ Erreur lors de la suppression du projet:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
  res.json({ success: true });
});

// 404
app.use((req, res) => {
  res.status(404).render('404', { page: '404' });
});

// Démarrer le serveur (seulement en local, pas sur Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(3000, function () {
    console.log("✓ Portfolio de Kiéran Le Troadec");
    console.log("✓ Server is running on http://localhost:3000");
  });
}

// Exporter pour Vercel
export default app;

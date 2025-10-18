import sqlite3Pkg from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const sqlite3 = sqlite3Pkg.verbose();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Créer ou ouvrir la base de données
const dbPath = path.join(__dirname, '../../data/portfolio.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erreur lors de l\'ouverture de la base de données:', err.message);
  } else {
    console.log('✓ Connecté à la base de données SQLite');
  }
});

// Créer la table projets si elle n'existe pas
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS projets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      annee TEXT NOT NULL,
      titre TEXT NOT NULL,
      description TEXT NOT NULL,
      competences TEXT NOT NULL,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Erreur lors de la création de la table:', err.message);
    } else {
      console.log('✓ Table projets créée ou déjà existante');
    }
  });

  // Vérifier si la table est vide et insérer des données par défaut
  db.get('SELECT COUNT(*) as count FROM projets', (err, row) => {
    if (err) {
      console.error('❌ Erreur lors de la vérification:', err.message);
    } else if (row.count === 0) {
      console.log('📝 Insertion des projets par défaut...');
      
      const projetsDefaut = [
        {
          annee: '2024',
          titre: 'Shirt',
          description: 'Création d\'un compte Instagram et d\'un magazine spécialisé autour des sneakers et des vêtements.',
          competences: 'Définition de l\'identité visuelle - choix du nom - conception du logo - charte graphique - élaboration de la ligne éditoriale - rédaction d\'articles - recherches documentaires - mise en page.'
        },
        {
          annee: '2024',
          titre: 'Recommandation de communication',
          description: 'Conception d\'une recommandation marketing et d\'un plan de communication pour accompagner la sortie et le repositionnement d\'un nouveau service.',
          competences: 'Audit de positionnement - analyse de concurrence - SWOT - PESTEL - plan/objectifs/moyens de communication - teaser - communiqué de presse.'
        },
        {
          annee: '2024',
          titre: 'Mix & Match (projet personnel)',
          description: 'Jeu de société pour animer les étudiants. Il mélange chance, endurance et convivialité.',
          competences: 'Création de visuels - charte éditoriale - audit de positionnement - recommandation de communication numérique.'
        }
      ];

      const stmt = db.prepare('INSERT INTO projets (annee, titre, description, competences) VALUES (?, ?, ?, ?)');
      
      projetsDefaut.forEach(projet => {
        stmt.run(projet.annee, projet.titre, projet.description, projet.competences);
      });
      
      stmt.finalize(() => {
        console.log('✓ Projets par défaut insérés');
      });
    }
  });
});

// Fonctions utilitaires
const db_functions = {
  // Récupérer tous les projets
  getAllProjets: (callback) => {
    db.all('SELECT * FROM projets ORDER BY annee DESC, id DESC', [], callback);
  },

  // Récupérer un projet par ID
  getProjetById: (id, callback) => {
    db.get('SELECT * FROM projets WHERE id = ?', [id], callback);
  },

  // Ajouter un projet
  addProjet: (projet, callback) => {
    const { annee, titre, description, competences, image } = projet;
    db.run(
      'INSERT INTO projets (annee, titre, description, competences, image) VALUES (?, ?, ?, ?, ?)',
      [annee, titre, description, competences, image || null],
      function(err) {
        callback(err, this ? this.lastID : null);
      }
    );
  },

  // Mettre à jour un projet
  updateProjet: (id, projet, callback) => {
    const { annee, titre, description, competences, image } = projet;
    db.run(
      'UPDATE projets SET annee = ?, titre = ?, description = ?, competences = ?, image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [annee, titre, description, competences, image || null, id],
      callback
    );
  },

  // Supprimer un projet
  deleteProjet: (id, callback) => {
    db.run('DELETE FROM projets WHERE id = ?', [id], callback);
  }
};

export { db, db_functions };

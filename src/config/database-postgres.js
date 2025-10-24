import { sql } from '@vercel/postgres';

// Initialiser la base de données (créer les tables)
export async function initDatabase() {
  try {
    // Créer la table projets si elle n'existe pas
    await sql`
      CREATE TABLE IF NOT EXISTS projets (
        id SERIAL PRIMARY KEY,
        annee TEXT NOT NULL,
        titre TEXT NOT NULL,
        description TEXT NOT NULL,
        competences TEXT NOT NULL,
        image TEXT,
        statut TEXT DEFAULT 'Terminé',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('✓ Table projets créée ou déjà existante');
    
    // Vérifier si la table est vide et insérer des données par défaut
    const { rows } = await sql`SELECT COUNT(*) as count FROM projets`;
    
    if (rows[0].count === '0') {
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
      
      for (const projet of projetsDefaut) {
        await sql`
          INSERT INTO projets (annee, titre, description, competences)
          VALUES (${projet.annee}, ${projet.titre}, ${projet.description}, ${projet.competences})
        `;
      }
      
      console.log('✓ Projets par défaut insérés');
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
  }
}

// Fonctions utilitaires pour Postgres
export const db_functions = {
  // Récupérer tous les projets
  getAllProjets: async () => {
    try {
      const { rows } = await sql`SELECT * FROM projets ORDER BY annee DESC, id DESC`;
      return { error: null, rows };
    } catch (error) {
      return { error, rows: [] };
    }
  },

  // Récupérer un projet par ID
  getProjetById: async (id) => {
    try {
      const { rows } = await sql`SELECT * FROM projets WHERE id = ${id}`;
      return { error: null, row: rows[0] || null };
    } catch (error) {
      return { error, row: null };
    }
  },

  // Ajouter un projet
  addProjet: async (projet) => {
    try {
      const { annee, titre, description, competences, image, statut } = projet;
      const { rows } = await sql`
        INSERT INTO projets (annee, titre, description, competences, image, statut)
        VALUES (${annee}, ${titre}, ${description}, ${competences}, ${image || null}, ${statut || 'Terminé'})
        RETURNING id
      `;
      return { error: null, id: rows[0].id };
    } catch (error) {
      return { error, id: null };
    }
  },

  // Mettre à jour un projet
  updateProjet: async (id, projet) => {
    try {
      const { annee, titre, description, competences, image, statut } = projet;
      await sql`
        UPDATE projets 
        SET annee = ${annee}, titre = ${titre}, description = ${description}, 
            competences = ${competences}, image = ${image || null}, statut = ${statut || 'Terminé'}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `;
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // Supprimer un projet
  deleteProjet: async (id) => {
    try {
      await sql`DELETE FROM projets WHERE id = ${id}`;
      return { error: null };
    } catch (error) {
      return { error };
    }
  }
};

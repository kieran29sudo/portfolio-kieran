// Fichier qui détecte automatiquement l'environnement et utilise la bonne DB

const isVercel = process.env.VERCEL === '1' || process.env.POSTGRES_URL;

let db_functions;
let initDatabase;

if (isVercel) {
  // En production sur Vercel : utiliser Postgres
  console.log('🚀 Environnement Vercel détecté - Utilisation de Postgres');
  const postgres = await import('./database-postgres.js');
  db_functions = postgres.db_functions;
  initDatabase = postgres.initDatabase;
} else {
  // En local : utiliser SQLite
  console.log('💻 Environnement local détecté - Utilisation de SQLite');
  const sqlite = await import('./database.js');
  db_functions = sqlite.db_functions;
  
  // Adapter les fonctions SQLite pour avoir la même interface async
  const originalFunctions = { ...db_functions };
  
  db_functions = {
    getAllProjets: () => {
      return new Promise((resolve) => {
        originalFunctions.getAllProjets((err, rows) => {
          resolve({ error: err, rows: rows || [] });
        });
      });
    },
    
    getProjetById: (id) => {
      return new Promise((resolve) => {
        originalFunctions.getProjetById(id, (err, row) => {
          resolve({ error: err, row: row || null });
        });
      });
    },
    
    addProjet: (projet) => {
      return new Promise((resolve) => {
        originalFunctions.addProjet(projet, (err, id) => {
          resolve({ error: err, id });
        });
      });
    },
    
    updateProjet: (id, projet) => {
      return new Promise((resolve) => {
        originalFunctions.updateProjet(id, projet, (err) => {
          resolve({ error: err });
        });
      });
    },
    
    deleteProjet: (id) => {
      return new Promise((resolve) => {
        originalFunctions.deleteProjet(id, (err) => {
          resolve({ error: err });
        });
      });
    }
  };
  
  // SQLite s'initialise automatiquement
  initDatabase = async () => {
    console.log('✓ SQLite initialisé');
  };
}

export { db_functions, initDatabase };

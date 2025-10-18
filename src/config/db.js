// Fichier qui détecte automatiquement l'environnement et utilise la bonne DB

const isVercel = process.env.VERCEL === '1' || process.env.POSTGRES_URL;

let db_functions;
let initDatabase;
let dbPromise;

if (isVercel) {
  // En production sur Vercel : utiliser Postgres
  console.log('🚀 Environnement Vercel détecté - Utilisation de Postgres');
  dbPromise = import('./database-postgres.js').then(postgres => {
    db_functions = postgres.db_functions;
    initDatabase = postgres.initDatabase;
    return { db_functions, initDatabase };
  });
} else {
  // En local : utiliser SQLite
  console.log('💻 Environnement local détecté - Utilisation de SQLite');
  dbPromise = import('./database.js').then(sqlite => {
    const originalFunctions = { ...sqlite.db_functions };
    
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
    
    return { db_functions, initDatabase };
  });
}

// Exporter une fonction qui attend que le module soit chargé
export async function getDB() {
  await dbPromise;
  return { db_functions, initDatabase };
}

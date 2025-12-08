/**
 * Script pour supprimer toutes les notifications du localStorage
 * À exécuter dans la console du navigateur ou via Node.js
 */

if (typeof window !== 'undefined') {
  // Exécution côté navigateur
  const STORAGE_PREFIX = 'adminibox_';
  const keys = Object.keys(localStorage);
  let deletedCount = 0;
  
  keys.forEach(key => {
    if (key.startsWith(`${STORAGE_PREFIX}notifications`) || key === `${STORAGE_PREFIX}processed_reminders`) {
      localStorage.removeItem(key);
      deletedCount++;
      console.log(`✅ Supprimé: ${key}`);
    }
  });
  
  console.log(`\n🎉 ${deletedCount} clé(s) supprimée(s). Rechargez la page pour voir les changements.`);
} else {
  // Exécution côté Node.js (si nécessaire)
  console.log('Ce script doit être exécuté dans la console du navigateur.');
  console.log('Ouvrez la console (F12) et copiez-collez ce code :');
  console.log(`
    const STORAGE_PREFIX = 'adminibox_';
    const keys = Object.keys(localStorage);
    let deletedCount = 0;
    
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX + 'notifications') || key === STORAGE_PREFIX + 'processed_reminders') {
        localStorage.removeItem(key);
        deletedCount++;
        console.log('✅ Supprimé: ' + key);
      }
    });
    
    console.log('🎉 ' + deletedCount + ' clé(s) supprimée(s). Rechargez la page.');
  `);
}


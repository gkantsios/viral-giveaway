import('./lib/auth.ts')
  .then(m => {
    console.log('Import successful');
    console.log('Exports:', Object.keys(m));
  })
  .catch(e => {
    console.log('Import error:', e.message);
  });

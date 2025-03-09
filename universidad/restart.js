
const { exec } = require('child_process');
const path = require('path');

// Esperar unos segundos antes de reiniciar
setTimeout(() => {
  console.log('🔄 Reiniciando aplicación...');
  
  // Usar el proceso hijo para ejecutar npm run start
  const child = exec('npm run start', {
    cwd: 'C:\\Users\\simon\\OneDrive\\Escritorio\\Nueva carpeta (10)\\taller_especialidad_universidad\\universidad'
  });
  
  child.stdout.on('data', (data) => {
    console.log(data);
  });
  
  child.stderr.on('data', (data) => {
    console.error(data);
  });
  
  child.on('close', (code) => {
    if (code !== 0) {
      console.log('⚠️ El proceso ha terminado con código: ' + code);
    } else {
      console.log('✅ Aplicación reiniciada correctamente');
    }
  });
}, 3000);

console.log('⏳ Preparando reinicio...');
      
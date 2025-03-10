const { spawn } = require('child_process');
  const path = require('path');
  const fs = require('fs');
  
  // Registrar el inicio del script
  fs.appendFileSync('restart.log', `[${new Date().toISOString()}] Iniciando reinicio...\n`);
  
  // Función para determinar la ruta del proyecto
  function getProjectPath() {
    // Intentar encontrar package.json para confirmar que estamos en la raíz del proyecto
    let currentDir = __dirname;
    while (!fs.existsSync(path.join(currentDir, 'package.json'))) {
      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) {
        // Llegamos a la raíz del sistema sin encontrar package.json
        fs.appendFileSync('restart.log', `[${new Date().toISOString()}] Error: No se pudo encontrar package.json\n`);
        return __dirname; // Usar __dirname como fallback
      }
      currentDir = parentDir;
    }
    return currentDir;
  }
  
  const projectPath = getProjectPath();
  fs.appendFileSync('restart.log', `[${new Date().toISOString()}] Ruta del proyecto: ${projectPath}\n`);
  
  // Esperar unos segundos antes de reiniciar
  setTimeout(() => {
    fs.appendFileSync('restart.log', `[${new Date().toISOString()}] Ejecutando npm run start en ${projectPath}\n`);
    
    // Usar spawn en lugar de exec para mejor manejo del proceso
    const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const child = spawn(command, ['run', 'start'], {
      cwd: projectPath,
      detached: true, // Permitir que el proceso continúe independientemente
      stdio: ['ignore', 
        fs.openSync(path.join(projectPath, 'restart-stdout.log'), 'a'),
        fs.openSync(path.join(projectPath, 'restart-stderr.log'), 'a')
      ]
    });
    
    // No esperar por el proceso hijo
    child.unref();
    
    fs.appendFileSync('restart.log', `[${new Date().toISOString()}] Proceso de reinicio iniciado con PID: ${child.pid}\n`);
  }, 3000);
  
  fs.appendFileSync('restart.log', `[${new Date().toISOString()}] Preparando reinicio...\n`);
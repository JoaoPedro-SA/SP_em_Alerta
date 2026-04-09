const fs = require('fs').promises;
const path = require('path');

// npm run postinstall 

async function fixMapsForWeb() {
     const modulePath = path.join(__dirname, 'node_modules/react-native-maps');
     try {
          // Cria um arquivo index.web.js vazio para evitar erros de importação na Web
          await fs.writeFile(path.join(modulePath, 'lib/index.web.js'), 'module.exports = {}', 'utf-8');

          // Copia as definições de tipos para evitar erros de TypeScript
          await fs.copyFile(path.join(modulePath, 'lib/index.d.ts'), path.join(modulePath, 'lib/index.web.d.ts'));

          // Atualiza o package.json da biblioteca para apontar para o novo arquivo na Web
          const pkgPath = path.join(modulePath, 'package.json');
          const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
          pkg['main'] = 'lib/index.web.js';
          await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2), 'utf-8');

          console.log('✅ react-native-maps corrigido para Web com sucesso.');
     } catch (err) {
          console.error('❌ Erro ao aplicar correção:', err);
     }
}

fixMapsForWeb();
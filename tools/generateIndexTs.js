const fs = require('fs');
const path = require('path');

const rootDir = process.cwd(); // Use the current working directory

function findTSFiles(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === 'node_modules') {
      // Skip the node_modules directory entirely
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Recurse into subdirectories
      findTSFiles(fullPath, fileList);
    } else if (entry.isFile() && entry.name.endsWith('.ts') && entry.name !== 'index.ts') {
      fileList.push(fullPath);
    }
  }

  return fileList;
}

function extractExportStatements(fileList) {
  const exportRegex = /export\s+(?:abstract\s+)?class\s+(\w+)/g;
  let exportStatements = [];

  fileList.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = exportRegex.exec(content)) !== null) {
      const relativePath = path.relative(rootDir, file).replace(/\\/g, '/');
      exportStatements.push(`export { ${match[1]} } from './${relativePath.replace('.ts', '')}';`);
    }
  });

  return exportStatements;
}

function generateIndex(exportStatements, outputPath) {
  fs.writeFileSync(outputPath, exportStatements.join('\n') + '\n');
}

const tsFiles = findTSFiles(rootDir);
const exportStatements = extractExportStatements(tsFiles);
const outputPath = path.join(rootDir, 'index.ts');

generateIndex(exportStatements, outputPath);
console.log(`index.ts has been created with ${exportStatements.length} exports.`);

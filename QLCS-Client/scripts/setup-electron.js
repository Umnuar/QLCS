import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import extract from 'extract-zip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientRoot = path.resolve(__dirname, '..');
const electronModuleDir = path.join(clientRoot, 'node_modules', 'electron');
const electronDistDir = path.join(electronModuleDir, 'dist');
const zipPath = path.join(
  process.env.LOCALAPPDATA || 'C:\\Users\\umnuar\\AppData\\Local',
  'electron',
  'Cache',
  'electron-v42.1.0-win32-x64.zip'
);

async function setupElectron() {
  console.log(`Setting up Electron binary from: ${zipPath}`);
  if (!fs.existsSync(zipPath)) {
    throw new Error(`Zip file not found at: ${zipPath}`);
  }

  if (!fs.existsSync(electronDistDir)) {
    fs.mkdirSync(electronDistDir, { recursive: true });
  }

  console.log(`Extracting to: ${electronDistDir}...`);
  await extract(zipPath, { dir: electronDistDir });

  const pathTxtFile = path.join(electronModuleDir, 'path.txt');
  fs.writeFileSync(pathTxtFile, 'electron.exe', 'utf-8');
  console.log(`Created path.txt with content: electron.exe`);

  const exePath = path.join(electronDistDir, 'electron.exe');
  if (fs.existsSync(exePath)) {
    console.log(`Success! electron.exe verified at ${exePath}`);
  } else {
    throw new Error(`electron.exe not found after extraction`);
  }
}

setupElectron().catch((err) => {
  console.error(err);
  process.exit(1);
});

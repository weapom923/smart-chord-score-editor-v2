import path from 'path';
import { execSync } from 'child_process';
import { chdir } from 'process';
import { renameSync, existsSync, unlinkSync } from 'fs';

const rootDir = path.join(__dirname, '..', '..');

const dockerfileDir = path.join(rootDir, 'wasm', 'waveform-decimator');
const dockerImageName = 'waveform-decimator';
chdir(dockerfileDir)
execSync(`docker build --rm -t ${dockerImageName} --output . .`);

const ScriptsDir = path.join(rootDir, 'src', 'modules');
const typeDefinitionFileName = 'waveform-decimator.d.ts';
const typeDefinitionFileDestPath = path.join(ScriptsDir, typeDefinitionFileName);
if (existsSync(typeDefinitionFileDestPath)) {
  unlinkSync(typeDefinitionFileDestPath);
}
renameSync(typeDefinitionFileName, typeDefinitionFileDestPath);

const moduleJavaScriptFileName = 'waveform-decimator.mjs';
const moduleJavaScriptFileDestPath = path.join(ScriptsDir, moduleJavaScriptFileName);
if (existsSync(moduleJavaScriptFileDestPath)) {
  unlinkSync(moduleJavaScriptFileDestPath);
}
renameSync(moduleJavaScriptFileName, moduleJavaScriptFileDestPath);

const publicWasmDir = path.join(rootDir, 'public', 'wasm');
const webAssemblyFileName = 'waveform-decimator.wasm';
const webAssemblyFileDestPath = path.join(publicWasmDir, webAssemblyFileName);
if (existsSync(webAssemblyFileDestPath)) {
  unlinkSync(webAssemblyFileDestPath);
}
renameSync(webAssemblyFileName, webAssemblyFileDestPath);

/**
 * This script fixes compatibility issues between Three.js and React 19
 * 
 * It addresses the following problems:
 * 1. LuminanceFormat being replaced with RedFormat in Three.js v0.176.0
 * 2. Duplicate imports in certain postprocessing passes
 * 
 * Run this before build with: node patches/fix-three-imports.js
 * or use the prebuild script in package.json
 */

const fs = require('fs');
const path = require('path');

// Function to replace LuminanceFormat with RedFormat
function patchLuminanceFormat(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('LuminanceFormat')) {
        content = content.replace(/LuminanceFormat/g, 'RedFormat');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Patched LuminanceFormat in ${filePath}`);
      }
    }
  } catch (err) {
    console.error(`❌ Error patching ${filePath}:`, err);
  }
}

// Function to fix duplicate imports
function fixDuplicateImports(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('import { GLSL3 }') && content.match(/import { GLSL3 }/g).length > 1) {
        content = content.replace(/import { GLSL3 } from 'three\/examples\/jsm\/renderers\/webgl\/WebGLProgram.js';/g, '// Duplicate import removed');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed duplicate imports in ${filePath}`);
      }
    }
  } catch (err) {
    console.error(`❌ Error fixing imports in ${filePath}:`, err);
  }
}

// Main function to apply all patches
function applyPatches() {
  console.log('🔧 Applying patches to Three.js dependencies...');
  
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  
  // Path to files that need patching
  const filmPassPath = path.join(nodeModulesPath, '@react-three', 'postprocessing', 'dist', 'esm', 'passes', 'FilmPass.js');
  const glitchPassPath = path.join(nodeModulesPath, '@react-three', 'postprocessing', 'dist', 'esm', 'passes', 'GlitchPass.js');
  
  // Apply patches
  patchLuminanceFormat(filmPassPath);
  patchLuminanceFormat(glitchPassPath);
  fixDuplicateImports(glitchPassPath);
  
  console.log('✨ Patching complete!');
}

// Run the patches
applyPatches(); 
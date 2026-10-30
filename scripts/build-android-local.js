const { execSync } = require('child_process');
const fs = require('fs');

// 1. Generate a timestamp (YYYY-MM-DD_HH-mm-ss)
const timestamp = new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-');

// 2. Ensure your custom output folder exists
const outputDir = './dist/builds';
if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir, { recursive: true });
}

// 3. Run the EAS build command with the dynamic filename
const command = `eas build --platform android --local --output=${outputDir}/build_${timestamp}.aab`;

console.log(`Starting local build: ${command}`);
execSync(command, { stdio: 'inherit' });
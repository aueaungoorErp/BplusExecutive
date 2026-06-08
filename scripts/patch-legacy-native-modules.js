const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const replacements = [
  [/^\s*jcenter\(\)\r?\n/gm, ''],
  [/\bcompile\s+(['"])/g, 'implementation $1'],
  [
    /implementation\s+"com\.android\.support:appcompat-v7:\$supportLibVersion"/g,
    'implementation "androidx.appcompat:appcompat:1.7.0"',
  ],
  [/^\s*def DEFAULT_SUPPORT_LIB_VERSION\s*=\s*"[^"]+"\r?\n/gm, ''],
  [
    /^\s*def supportLibVersion = rootProject\.hasProperty\('supportLibVersion'\) \? rootProject\.supportLibVersion : DEFAULT_SUPPORT_LIB_VERSION\r?\n/gm,
    '',
  ],
  [
    /@react-native-community\/masked-view/g,
    '@react-native-masked-view/masked-view',
  ],
];

function findAndroidBuildGradleFiles(dir, results = []) {
  if (!fs.existsSync(dir)) {
    return results;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);

    if (!entry.isDirectory()) {
      continue;
    }

    const androidBuildGradle = path.join(entryPath, 'android', 'build.gradle');
    if (fs.existsSync(androidBuildGradle)) {
      results.push(androidBuildGradle);
    }

    if (entry.name.startsWith('@')) {
      findAndroidBuildGradleFiles(entryPath, results);
    }
  }

  return results;
}

for (const filePath of findAndroidBuildGradleFiles(
  path.join(root, 'node_modules'),
)) {
  const relativePath = path.relative(root, filePath).replace(/\\/g, '/');

  if (!fs.existsSync(filePath)) {
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  for (const [pattern, replacement] of replacements) {
    content = content.replace(pattern, replacement);
  }

  content = content.replace(/repositories\s*\{([\s\S]*?)\n\s*\}/g, match => {
    if (match.includes('mavenCentral()')) {
      return match;
    }

    return match.replace('{', '{\n        mavenCentral()');
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Patched ${relativePath}`);
  }
}

import fs from 'fs';
import path from 'path';

const friendsDir = path.join(process.cwd(), 'static/friends/lists');
const sponsorsDir = path.join(process.cwd(), 'static/sponsors/lists');
const outputDir = path.join(process.cwd(), 'src/lib/data');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function readJsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter(file => file.endsWith('.json'));
  return files.map(file => {
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  });
}

const friends = readJsonFiles(friendsDir);
const sponsors = readJsonFiles(sponsorsDir);

const data = {
  friends,
  sponsors
};

fs.writeFileSync(path.join(outputDir, 'static-data.ts'), `export const staticData = ${JSON.stringify(data, null, 2)};`);

console.log('Static data generated successfully');
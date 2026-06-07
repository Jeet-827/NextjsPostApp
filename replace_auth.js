const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, 'app', 'api');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(apiDir);
files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let replaced = false;

  // Replace getAuthUser(req) with await getAuthUser(req)
  // avoiding duplicate await if already present
  if (content.includes('getAuthUser(req)') && !content.includes('await getAuthUser(req)')) {
    content = content.replace(/getAuthUser\(req\)/g, 'await getAuthUser(req)');
    replaced = true;
  }
  
  if (content.includes('getAuthUser(request)') && !content.includes('await getAuthUser(request)')) {
    content = content.replace(/getAuthUser\(request\)/g, 'await getAuthUser(request)');
    replaced = true;
  }

  if (replaced) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated: ${file}`);
  }
});

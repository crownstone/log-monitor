const path = require("path");
const fs   = require("fs");

console.log("Removing all processed data");

let base = path.join(__dirname, '../logs');
let logUsers = fs.readdirSync(base);
for (let item of logUsers) {
  let itemPath = path.join(base, item);

  let stat = fs.statSync(itemPath);
  if (stat.isDirectory() === false) {
    continue;
  }

  if (fs.existsSync(path.join(itemPath, 'processed'))) {
    fs.rmdirSync(path.join(itemPath, 'processed'), {force: true, recursive: true});
    console.log("Removed", path.join(itemPath, 'processed'))
  }
}

console.log("Done.")

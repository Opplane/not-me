const glob = require("glob");
const { promisify } = require("util");
const fs = require("fs");
const writeFile = promisify(fs.writeFile);

const declarationFiles = glob.sync("lib/**/*.d.ts");

const file = declarationFiles.reduce((content, current) => {
  const relativePath = current.substring(4);

  return content + `/// <reference path="./${relativePath}" />` + "\n";
}, "");

writeFile("lib/index.d.ts", file).catch((err) => {
  console.error(err);
  process.exit(1);
});

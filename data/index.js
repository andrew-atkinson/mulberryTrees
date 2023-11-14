import { readFileSync, writeFile } from "node:fs";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let inputFile = readFileSync(
  `${__dirname}/RAWforestryMulberry.json`,
  (err, raw) => {
    if (err) throw err;
  }
);

let mulberryJSON = JSON.parse(inputFile)
  .data
  .filter((line) => {
    return line[16] == "Morus - mulberry";
  })
  .map((line) => {
    return [
      Number(line[9]),
      line[10],
      line[11],
      Number(line[14].split(" ")[1].slice(1)),
      Number(line[14].split(" ")[2].slice(0, -1)),
    ];
  });

let outputFile = 'forestryMulberryProcessed.json';

let fileContents = JSON.stringify(mulberryJSON);

writeFile(
  `${__dirname}/../web/${outputFile}`,
  fileContents,
  (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`file: web/${outputFile} written! Number of mulberry trees found:${mulberryJSON.length}.`);
    }
  }
);

writeFile(
  `${__dirname}/../svg/${outputFile}`,
 fileContents,
  (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`file: svg/${outputFile} written! Number of mulberry trees found:${mulberryJSON.length}.`);
    }
  }
);

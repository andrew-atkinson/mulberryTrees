import { readFileSync, writeFile } from "node:fs";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let inputFile = readFileSync(
  `${__dirname}/USA_New_York_City_location_map.svg`,
  (err, raw) => {
    if (err) throw err;
  }
);

let mulberryFile = readFileSync(
  `${__dirname}/forestryMulberryProcessed.json`,
  (err, raw) => {
    if (err) throw err;
  }
);
let mulberryData = JSON.parse(mulberryFile);

let parksFile = readFileSync(`${__dirname}/ParksZones.geojson`, (err, raw) => {
  if (err) throw err;
});
let parksData = JSON.parse(parksFile);
// first coord pair: features index changes the polygon > parksData.features[0].geometry.coordinates[0][0][0] <last index changes the coord pairs

let minLat = 90,
  maxLat = 0,
  minLong = 90,
  maxLong = -90;
let sizeDist = [];
let sizeIdx = 0;

for (let i = 0; i < mulberryData.length; i++) {
  // find range of data for the latlong
  if (mulberryData[i][4] < minLat) {
    minLat = mulberryData[i][4];
  }
  if (mulberryData[i][4] > maxLat) {
    maxLat = mulberryData[i][4];
  }
  if (mulberryData[i][3] < minLong) {
    minLong = mulberryData[i][3];
  }
  if (mulberryData[i][3] > maxLong) {
    maxLong = mulberryData[i][3];
  }
  // find range of data for size
  sizeIdx = parseInt(mulberryData[i][0]);
  if (!sizeDist[sizeIdx]) {
    sizeDist[sizeIdx] = 1;
  } else {
    sizeDist[sizeIdx]++;
  }
}

/*
// finds the three ranges, small, medium, large, for the tree colors
let median = sizeDist.reduce((acc, curr) => acc + curr, 0) / 3;
console.log("median: " + median);

let ranges = [];
sizeDist.reduce((acc, curr, i) => {
  if ((acc + curr) % 2495.6 < curr) {
    ranges.push(i);
  }
  return acc + curr;
});
console.log("ranges: " + ranges);

let sizeRange = sizeDist
  .map((val, i) => {
    return `${i}: ${val},\n`;
  })
  .reduce((acc, curr) => acc + curr, "");
console.log(sizeRange);
*/

// set up output file = map background and clip the closing tag off.
let outputFile = inputFile.toString().slice(0, inputFile.length - 7) + "<g>\n";

// utility function for scaling the long lat to x y for circles
function longLatToXYmap(long, lat) {
  let outX = 21.5 + (long + -minLong) * 1356;
  let outY = 14 + (maxLat - lat) * 1762;
  return [outX, outY];
}

// add the parks to the outputfile

for (let i = 0; i < parksData.features.length; i++) {
  let polygonPoints = "";
  let parkCoords = "parksData.features[i].geometry.coordinates[0][0]";
  for (let j = 0; j < parkCoords.length; j++) {
    let long = parkCoords[j][0];
    let lat = parkCoords[j][1];
    var [x, y] = longLatToXYmap(long, lat);
    polygonPoints += `${x},${y} `;
  }
  outputFile += `<polygon points="${polygonPoints}" fill="rgb(100,245,170)" stroke="none" />\n`;
}
outputFile += "</g>";

// draw the circles
outputFile += "<g>";
for (let i = 0; i < mulberryData.length; i++) {
  let [x, y] = longLatToXYmap(mulberryData[i][3], mulberryData[i][4]);
  let f;
  if (mulberryData[i][0] <= 9) {
    f = `rgb(0,0,0)`;
  } else if (mulberryData[i][0] <= 18) {
    f = `rgb(100,100,100)`;
  } else {
    f = `rgb(200,200,200)`;
  }
  outputFile += `<circle cx="${x}" cy="${y}" r=".5" fill="${f}" stroke-width="0"/>\n`;
}

// add closing tags
outputFile += "</g></svg>";

// write the file
writeFile(
  `${__dirname}/../svg/mulberryMap.svg`,
  Buffer.from(outputFile, "utf-8"),
  (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`file: svg/mulberryMap.svg was written!`);
    }
  }
);

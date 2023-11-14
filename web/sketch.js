// Options for map
const options = {
  lat: 40.8,
  lng: -73.9,
  zoom: 12,
  style: "https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png",
};

// Create an instance of Leaflet
const mappa = new Mappa("Leaflet");
let myMap;

let canvas;
let mulberries;
let mulberriesLength;

function preload() {
  // Load the data
  let path = `forestryMulberryProcessed.json`;
  mulberries = loadJSON(path);
}

function setup() {
  mulberriesLength = Object.keys(mulberries).length;

  canvas = createCanvas(windowWidth, windowHeight);

  // Create a tile map and overlay the canvas on top.
  myMap = mappa.tileMap(options);
  myMap.overlay(canvas);

  // Only redraw the mulberries when the map change and not every frame.
  myMap.onChange(drawmulberries);

  fill(70, 203, 31);
  stroke(100);
}

function drawmulberries() {
  // Clear the canvas
  clear();

  for (let i = 0; i < mulberriesLength; i++) {
    // Get the lat/lng of each meteorite
    const latitude = mulberries[i][4];
    const longitude = mulberries[i][3];

    // Only draw them if the position is inside the current map bounds. We use a
    // Leaflet method to check if the lat and lng are contain inside the current
    // map. This way we draw just what we are going to see and not everything. See
    // getBounds() in http://leafletjs.com/reference-1.1.0.html
    if (myMap.map.getBounds().contains({ lat: latitude, lng: longitude })) {
      // Transform lat/lng to pixel position
      const pos = myMap.latLngToPixel(latitude, longitude);

      // Get the size of the meteorite and map it. 60000000 is the mass of the largest
      // meteorite (https://en.wikipedia.org/wiki/Hoba_meteorite)
      // let size = mulberries.getString(i, "mass (g)");
      size = map(mulberries[i][0], 0, 100, 2, 10) * (myMap.zoom() / 6);
      fill(30, 100 + size * 10, 31 + size * 3);
      ellipse(pos.x, pos.y, size, size);
    }
  }
}

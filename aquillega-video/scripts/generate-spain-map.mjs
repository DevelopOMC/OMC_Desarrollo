/**
 * Genera src/data/spain-map.ts: silueta vectorial simplificada de España
 * (península + Baleares + recuadro de Canarias) y los vecinos de contexto.
 *
 * Fuente: Natural Earth 1:50m (paquete `world-atlas`, dominio público).
 * Proyección: Mercator, escalada a un viewBox de 1000 unidades de ancho.
 *
 * Uso: npm run generate:map
 */
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const topology = require("world-atlas/countries-50m.json");
const countries = feature(topology, topology.objects.countries).features;

const byId = (id) => countries.find((f) => f.id === id);
const polygonsOf = (f) =>
  f.geometry.type === "Polygon"
    ? [f.geometry.coordinates]
    : f.geometry.coordinates;

// --- Proyección -------------------------------------------------------------
const DEG = Math.PI / 180;
const mercator = ([lon, lat]) => [
  lon * DEG,
  -Math.log(Math.tan(Math.PI / 4 + (lat * DEG) / 2)),
];

const VIEWBOX_WIDTH = 1000;
const PADDING = 24;
// Encuadre de la península + Baleares
const FRAME = { west: -9.45, east: 4.45, north: 43.85, south: 35.9 };

const [x0, y0] = mercator([FRAME.west, FRAME.north]);
const [x1, y1] = mercator([FRAME.east, FRAME.south]);
const scale = (VIEWBOX_WIDTH - PADDING * 2) / (x1 - x0);
const project = (lonLat) => {
  const [x, y] = mercator(lonLat);
  return [PADDING + (x - x0) * scale, PADDING + (y - y0) * scale];
};
const frameHeight = PADDING * 2 + (y1 - y0) * scale;

// --- Recuadro de Canarias (esquina inferior izquierda) ----------------------
const CANARIAS = { west: -18.25, east: -13.35, north: 29.5, south: 27.55 };
const [cx0, cy0] = project([CANARIAS.west, CANARIAS.north]);
const [cx1, cy1] = project([CANARIAS.east, CANARIAS.south]);
const INSET_PAD = 18;
const insetBox = {
  x: PADDING,
  y: frameHeight - PADDING + 36,
  width: cx1 - cx0 + INSET_PAD * 2,
  height: cy1 - cy0 + INSET_PAD * 2,
};
const insetOffset = [
  insetBox.x + INSET_PAD - cx0,
  insetBox.y + INSET_PAD - cy0,
];
const projectCanarias = (lonLat) => {
  const [x, y] = project(lonLat);
  return [x + insetOffset[0], y + insetOffset[1]];
};
const VIEWBOX_HEIGHT = Math.ceil(insetBox.y + insetBox.height + PADDING);

// --- Simplificación (Ramer–Douglas–Peucker) --------------------------------
const perpendicularDistance = ([px, py], [ax, ay], [bx, by]) => {
  const dx = bx - ax;
  const dy = by - ay;
  if (dx === 0 && dy === 0) return Math.hypot(px - ax, py - ay);
  const t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
};
const simplify = (points, epsilon) => {
  if (points.length < 3) return points;
  let maxDistance = 0;
  let index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i], points[0], points.at(-1));
    if (d > maxDistance) {
      maxDistance = d;
      index = i;
    }
  }
  if (maxDistance <= epsilon) return [points[0], points.at(-1)];
  const left = simplify(points.slice(0, index + 1), epsilon);
  const right = simplify(points.slice(index), epsilon);
  return [...left.slice(0, -1), ...right];
};

const round = (n) => Math.round(n * 10) / 10;
const ringToPath = (ring, projector, epsilon) => {
  const pts = simplify(ring.map(projector), epsilon);
  if (pts.length < 3) return "";
  return "M" + pts.map(([x, y]) => `${round(x)} ${round(y)}`).join("L") + "Z";
};

const isCanarias = ([lon, lat]) => lat < 30 && lon < -12;
const isBaleares = ([lon, lat]) => lon > 1 && lat > 38 && lat < 40.5;

const spain = byId("724");
let mainland = "";
let baleares = "";
let canarias = "";
for (const polygon of polygonsOf(spain)) {
  const outer = polygon[0];
  const [lon, lat] = outer[0];
  if (isCanarias([lon, lat])) {
    canarias += ringToPath(outer, projectCanarias, 0.6);
  } else if (isBaleares([lon, lat])) {
    baleares += ringToPath(outer, project, 0.6);
  } else if (lat > 35.5) {
    mainland += ringToPath(outer, project, 0.9);
  }
}

// Recorta un anillo proyectado al rectángulo visible (Sutherland–Hodgman),
// para no arrastrar territorios lejanos (Azores, Córcega, ultramar...).
const CLIP = {
  minX: -40,
  minY: -40,
  maxX: VIEWBOX_WIDTH + 40,
  maxY: VIEWBOX_HEIGHT + 40,
};
const clipRing = (points) => {
  const edges = [
    [(p) => p[0] >= CLIP.minX, (a, b) => intersectX(a, b, CLIP.minX)],
    [(p) => p[0] <= CLIP.maxX, (a, b) => intersectX(a, b, CLIP.maxX)],
    [(p) => p[1] >= CLIP.minY, (a, b) => intersectY(a, b, CLIP.minY)],
    [(p) => p[1] <= CLIP.maxY, (a, b) => intersectY(a, b, CLIP.maxY)],
  ];
  let output = points;
  for (const [inside, intersect] of edges) {
    const input = output;
    output = [];
    for (let i = 0; i < input.length; i++) {
      const current = input[i];
      const previous = input[(i + input.length - 1) % input.length];
      if (inside(current)) {
        if (!inside(previous)) output.push(intersect(previous, current));
        output.push(current);
      } else if (inside(previous)) {
        output.push(intersect(previous, current));
      }
    }
    if (output.length === 0) return [];
  }
  return output;
};
const intersectX = ([ax, ay], [bx, by], x) => [
  x,
  ay + ((by - ay) * (x - ax)) / (bx - ax),
];
const intersectY = ([ax, ay], [bx, by], y) => [
  ax + ((bx - ax) * (y - ay)) / (by - ay),
  y,
];

const neighbour = (id) =>
  polygonsOf(byId(id))
    .map((polygon) => {
      const clipped = clipRing(polygon[0].map(project));
      const pts = simplify(clipped, 1.2);
      if (pts.length < 3) return "";
      return (
        "M" + pts.map(([x, y]) => `${round(x)} ${round(y)}`).join("L") + "Z"
      );
    })
    .join("");

const portugal = neighbour("620");
const france = neighbour("250");
const andorra = neighbour("020");

const header = `// Archivo generado por scripts/generate-spain-map.mjs. No editar a mano.
// Datos: Natural Earth 1:50m (dominio público) vía world-atlas.
`;

const body = `
export const SPAIN_VIEWBOX = { width: ${VIEWBOX_WIDTH}, height: ${VIEWBOX_HEIGHT} } as const;

/** Península (paths SVG en coordenadas del viewBox). */
export const SPAIN_MAINLAND_PATH = ${JSON.stringify(mainland)};
export const BALEARES_PATH = ${JSON.stringify(baleares)};
export const CANARIAS_PATH = ${JSON.stringify(canarias)};
export const CANARIAS_BOX = ${JSON.stringify({
  x: round(insetBox.x),
  y: round(insetBox.y),
  width: round(insetBox.width),
  height: round(insetBox.height),
})} as const;

/** Países vecinos, solo como contexto visual. */
export const PORTUGAL_PATH = ${JSON.stringify(portugal)};
export const FRANCE_PATH = ${JSON.stringify(france)};
export const ANDORRA_PATH = ${JSON.stringify(andorra)};

const MERCATOR = ${JSON.stringify({ x0, y0, scale, padding: PADDING })};
const CANARIAS_OFFSET = ${JSON.stringify(insetOffset.map(round))};

/** Proyecta [longitud, latitud] a coordenadas del viewBox del mapa. */
export const projectLonLat = (lon: number, lat: number): [number, number] => {
  const x = (lon * Math.PI) / 180;
  const y = -Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  const px = MERCATOR.padding + (x - MERCATOR.x0) * MERCATOR.scale;
  const py = MERCATOR.padding + (y - MERCATOR.y0) * MERCATOR.scale;
  // Canarias se dibujan desplazadas dentro de su recuadro.
  if (lat < 30 && lon < -12) {
    return [px + CANARIAS_OFFSET[0], py + CANARIAS_OFFSET[1]];
  }
  return [px, py];
};
`;

const out = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "data",
  "spain-map.ts",
);
writeFileSync(out, header + body);
console.log(
  `spain-map.ts generado (${VIEWBOX_WIDTH}x${VIEWBOX_HEIGHT}, ${(header + body).length} bytes)`,
);

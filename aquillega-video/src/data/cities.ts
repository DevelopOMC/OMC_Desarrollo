/**
 * Ciudades en las que opera AquíLLega (mismas coordenadas que el mapa de
 * aquillega.es), en el orden en que se iluminan en el vídeo.
 * `label` indica dónde colocar el nombre respecto al punto.
 */
export type City = {
  name: string;
  lon: number;
  lat: number;
  label: "right" | "left" | "top" | "bottom";
};

export const CITIES: City[] = [
  { name: "Madrid", lon: -3.7038, lat: 40.4168, label: "right" },
  { name: "Valladolid", lon: -4.7245, lat: 41.6523, label: "top" },
  { name: "Zaragoza", lon: -0.8773, lat: 41.6488, label: "top" },
  { name: "Valencia", lon: -0.3763, lat: 39.4699, label: "right" },
  { name: "Sevilla", lon: -5.9845, lat: 37.3891, label: "left" },
  { name: "Bilbao", lon: -2.9253, lat: 43.263, label: "right" },
  { name: "Barcelona", lon: 2.1734, lat: 41.3851, label: "top" },
  { name: "Málaga", lon: -4.4214, lat: 36.7213, label: "bottom" },
  { name: "Alicante", lon: -0.481, lat: 38.3452, label: "right" },
  { name: "Murcia", lon: -1.1307, lat: 37.9922, label: "left" },
  { name: "Palma", lon: 2.6502, lat: 39.5696, label: "bottom" },
  { name: "A Coruña", lon: -8.4115, lat: 43.3623, label: "right" },
  { name: "Vigo", lon: -8.7207, lat: 42.2328, label: "right" },
  { name: "Las Palmas", lon: -15.4128, lat: 28.0997, label: "right" },
  { name: "Tenerife", lon: -16.2519, lat: 28.4636, label: "top" },
];

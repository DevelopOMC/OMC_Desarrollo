/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
// Gráficos planos con bordes nítidos: JPEG intermedio de alta calidad.
Config.setJpegQuality(95);
// Colores de marca fieles en cualquier reproductor (será el valor por defecto en Remotion 5).
Config.setColorSpace("bt709");
Config.setOverwriteOutput(true);

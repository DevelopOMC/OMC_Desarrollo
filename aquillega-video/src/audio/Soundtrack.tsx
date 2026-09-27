import { Audio } from "@remotion/media";
import React from "react";
import { interpolate, staticFile } from "remotion";
import { clamp } from "../lib/animation";
import { DURATION_IN_FRAMES } from "../timeline";

/**
 * 🎵 PISTA MUSICAL
 * Coloca la pista definitiva (up-tempo corporativa, con licencia) en:
 *
 *     public/audio/musica-corporativa.mp3
 *
 * con ese mismo nombre, o cambia MUSIC_FILE. El archivo que hay ahora es un
 * placeholder generado con `npm run generate:music` (120 BPM: los cortes de
 * escena caen a tempo).
 */
export const MUSIC_FILE = "audio/musica-corporativa.mp3";

export const Soundtrack: React.FC = () => (
  <Audio
    src={staticFile(MUSIC_FILE)}
    volume={(frame) =>
      interpolate(
        frame,
        [0, 8, DURATION_IN_FRAMES - 36, DURATION_IN_FRAMES],
        [0, 0.9, 0.9, 0],
        clamp,
      )
    }
  />
);

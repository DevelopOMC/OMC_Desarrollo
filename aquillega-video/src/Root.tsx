import React from "react";
import { Composition, Folder } from "remotion";
import { NegocioAd } from "./NegocioAd";
import { ScenePreview } from "./ScenePreview";
import {
  DURATION_IN_FRAMES,
  FORMATS,
  FPS,
  SCENES,
  type SceneId,
} from "./timeline";

const SCENE_NAMES: Record<SceneId, string> = {
  caos: "Escena1-Caos",
  alta: "Escena2-Alta",
  ventajas: "Escena3-Ventajas",
  ruta: "Escena4-Ruta",
  mapa: "Escena5-Mapa",
  cta: "Escena6-CTA",
};

const sceneIds = Object.keys(SCENES) as SceneId[];

export const RemotionRoot: React.FC = () => (
  <>
    {/* Anuncio completo: 30 s a 30 fps */}
    <Composition
      id="NegocioAd"
      component={NegocioAd}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      {...FORMATS.vertical}
    />
    <Composition
      id="NegocioAd-16x9"
      component={NegocioAd}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      {...FORMATS.horizontal}
    />

    {/* Cada escena por separado, en ambos formatos */}
    <Folder name="Escenas-9x16">
      {sceneIds.map((scene) => (
        <Composition
          key={scene}
          id={SCENE_NAMES[scene]}
          component={ScenePreview}
          defaultProps={{ scene }}
          durationInFrames={SCENES[scene].durationInFrames}
          fps={FPS}
          {...FORMATS.vertical}
        />
      ))}
    </Folder>
    <Folder name="Escenas-16x9">
      {sceneIds.map((scene) => (
        <Composition
          key={scene}
          id={`${SCENE_NAMES[scene]}-16x9`}
          component={ScenePreview}
          defaultProps={{ scene }}
          durationInFrames={SCENES[scene].durationInFrames}
          fps={FPS}
          {...FORMATS.horizontal}
        />
      ))}
    </Folder>
  </>
);

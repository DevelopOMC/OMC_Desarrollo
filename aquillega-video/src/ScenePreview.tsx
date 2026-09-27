import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { MUSIC_FILE } from "./audio/Soundtrack";
import { Background } from "./components/Background";
import { Scene1Caos } from "./scenes/Scene1Caos";
import { Scene2Alta } from "./scenes/Scene2Alta";
import { Scene3Ventajas } from "./scenes/Scene3Ventajas";
import { Scene4Ruta } from "./scenes/Scene4Ruta";
import { Scene5Mapa } from "./scenes/Scene5Mapa";
import { Scene6Cta } from "./scenes/Scene6Cta";
import { SCENES, type SceneId } from "./timeline";

export const SCENE_COMPONENTS: Record<SceneId, React.FC> = {
  caos: Scene1Caos,
  alta: Scene2Alta,
  ventajas: Scene3Ventajas,
  ruta: Scene4Ruta,
  mapa: Scene5Mapa,
  cta: Scene6Cta,
};

/**
 * Una escena suelta (con su fondo y su tramo de música) para revisarla de
 * forma aislada en Remotion Studio.
 */
export const ScenePreview: React.FC<{ scene: SceneId }> = ({ scene }) => {
  const Scene = SCENE_COMPONENTS[scene];
  return (
    <AbsoluteFill>
      <Background neutral={scene === "caos" ? 1 : 0} />
      <Scene />
      <Audio
        src={staticFile(MUSIC_FILE)}
        trimBefore={SCENES[scene].from}
        volume={0.9}
      />
    </AbsoluteFill>
  );
};

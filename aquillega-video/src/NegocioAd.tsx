import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Soundtrack } from "./audio/Soundtrack";
import { Background } from "./components/Background";
import { clamp } from "./lib/animation";
import { Scene1Caos } from "./scenes/Scene1Caos";
import { Scene2Alta } from "./scenes/Scene2Alta";
import { Scene3Ventajas } from "./scenes/Scene3Ventajas";
import { Scene4Ruta } from "./scenes/Scene4Ruta";
import { Scene5Mapa } from "./scenes/Scene5Mapa";
import { Scene6Cta } from "./scenes/Scene6Cta";
import { SCENES } from "./timeline";

/**
 * Composición principal (30 s). Misma pieza para 9:16 y 16:9: cada escena
 * lee el tamaño del vídeo y adapta su disposición.
 */
export const NegocioAd: React.FC = () => {
  const frame = useCurrentFrame();
  // Escena 1 sobre fondo neutro; la marca "colorea" el fondo al entrar la 2.
  const neutral = interpolate(frame, [104, 126], [1, 0], clamp);

  return (
    <AbsoluteFill>
      <Background neutral={neutral} />
      <Sequence name="1 · Caos" {...SCENES.caos}>
        <Scene1Caos />
      </Sequence>
      <Sequence name="2 · Alta" {...SCENES.alta}>
        <Scene2Alta />
      </Sequence>
      <Sequence name="3 · Ventajas" {...SCENES.ventajas}>
        <Scene3Ventajas />
      </Sequence>
      <Sequence name="4 · Ruta" {...SCENES.ruta}>
        <Scene4Ruta />
      </Sequence>
      <Sequence name="5 · Mapa" {...SCENES.mapa}>
        <Scene5Mapa />
      </Sequence>
      <Sequence name="6 · CTA" {...SCENES.cta}>
        <Scene6Cta />
      </Sequence>
      <Soundtrack />
    </AbsoluteFill>
  );
};

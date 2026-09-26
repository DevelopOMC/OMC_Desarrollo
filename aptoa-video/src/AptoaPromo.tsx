import React from 'react';
import {AbsoluteFill, Html5Audio, Sequence, getStaticFiles, staticFile, useCurrentFrame} from 'remotion';
import './fonts';
import cues from './cues.json';
import {Grain} from './components/Backgrounds';
import {SceneContainer, TransitionSpec} from './components/SceneContainer';
import {BrandScene} from './scenes/Brand';
import {CTAScene} from './scenes/CTA';
import {DriveIQScene} from './scenes/DriveIQ';
import {HookScene} from './scenes/Hook';
import {ProofScene} from './scenes/Proof';
import {RouteBookScene} from './scenes/RouteBook';
import {SmartImportScene} from './scenes/SmartImport';
import {StudentAppScene} from './scenes/StudentApp';

const S = cues.scenes;
const TR = cues.transitions as Record<string, TransitionSpec>;
const SOUNDTRACK = 'audio/aptoa-soundtrack.wav';

type SceneDef = {
  id: keyof typeof S;
  Comp: React.FC<{frame: number}>;
  enter?: TransitionSpec;
  exit?: TransitionSpec;
  drift?: number;
};

const SCENES: SceneDef[] = [
  {id: 'hook', Comp: HookScene, drift: 0.02},
  {id: 'brand', Comp: BrandScene, exit: TR.brandToImport, drift: 0.03},
  {id: 'import', Comp: SmartImportScene, enter: TR.brandToImport, exit: TR.importToDrive},
  {id: 'driveiq', Comp: DriveIQScene, enter: TR.importToDrive, exit: TR.driveToRoute},
  {id: 'routebook', Comp: RouteBookScene, enter: TR.driveToRoute, exit: TR.routeToApp},
  {id: 'app', Comp: StudentAppScene, enter: TR.routeToApp, exit: TR.appToProof},
  {id: 'proof', Comp: ProofScene, enter: TR.appToProof},
  {id: 'cta', Comp: CTAScene, enter: TR.proofToCta, drift: 0.025},
];

const SceneSlot: React.FC<{def: SceneDef}> = ({def}) => {
  const {from, to} = S[def.id];
  const frame = useCurrentFrame() + from;
  const {Comp} = def;
  return (
    <SceneContainer id={def.id} frame={frame} from={from} to={to} enter={def.enter} exit={def.exit} drift={def.drift}>
      <Comp frame={frame} />
    </SceneContainer>
  );
};

/** Sacudida de cámara breve sincronizada con los impactos graves de la música. */
const shakeAt = (frame: number, at: number, amp: number) =>
  frame >= at && frame < at + 16 ? amp * Math.exp(-(frame - at) / 3.2) : 0;

export const AptoaPromo: React.FC = () => {
  const frame = useCurrentFrame();
  const hasAudio = getStaticFiles().some((f) => f.name === SOUNDTRACK);
  const shake = shakeAt(frame, cues.brand.impact, 13) + shakeAt(frame, cues.cta.impact, 11);
  const sx = shake * Math.sin(frame * 2.9);
  const sy = shake * Math.cos(frame * 3.7);
  return (
    <AbsoluteFill style={{background: '#0B0E2B'}}>
      {hasAudio ? <Html5Audio src={staticFile(SOUNDTRACK)} /> : null}
      <AbsoluteFill style={{transform: shake > 0.05 ? `translate(${sx}px, ${sy}px) scale(1.02)` : undefined}}>
        {SCENES.map((def) => (
          <Sequence key={def.id} name={def.id} from={S[def.id].from} durationInFrames={S[def.id].to - S[def.id].from}>
            <SceneSlot def={def} />
          </Sequence>
        ))}
      </AbsoluteFill>
      <Grain frame={frame} opacity={0.05} />
    </AbsoluteFill>
  );
};

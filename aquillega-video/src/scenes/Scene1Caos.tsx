import {
  makeTransform,
  rotate,
  scale,
  translate,
} from "@remotion/animation-utils";
import {
  Bell,
  Bike,
  Clock,
  MessageCircle,
  Phone,
  ShoppingBag,
  Store,
  type LucideIcon,
} from "lucide-react";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { DrawIcon, IconTile } from "../components/Icons";
import { SceneContainer } from "../components/SceneContainer";
import { SpringText } from "../components/SpringText";
import { clamp, fadeFrom, springAt } from "../lib/animation";
import { useLayout } from "../lib/useLayout";
import { colors, fonts, radii, shadows, springs } from "../theme";
import { SCENES } from "../timeline";

const { durationInFrames } = SCENES.caos;

type Notification =
  | {
      kind: "badge";
      x: number;
      y: number;
      size: number;
      label?: string;
      icon?: LucideIcon;
    }
  | { kind: "toast"; x: number; y: number; label: string; icon: LucideIcon };

/** Posiciones relativas al centro del local, en orden de aparición. */
const NOTIFICATIONS: Notification[] = [
  { kind: "toast", x: -20, y: -335, label: "Nuevo pedido", icon: ShoppingBag },
  { kind: "badge", x: -255, y: -165, size: 92, label: "1" },
  { kind: "badge", x: 290, y: -25, size: 100, icon: Bell },
  { kind: "toast", x: 215, y: 290, label: "¿Quién reparte?", icon: Bike },
  { kind: "badge", x: -300, y: 70, size: 90, label: "3" },
  { kind: "badge", x: 300, y: -255, size: 96, icon: Phone },
  { kind: "badge", x: -255, y: 235, size: 86, label: "!" },
  { kind: "toast", x: -60, y: 395, label: "Cliente esperando", icon: Clock },
  { kind: "badge", x: -330, y: -300, size: 92, icon: MessageCircle },
  { kind: "badge", x: 360, y: 95, size: 96, label: "9+" },
  { kind: "badge", x: -365, y: -75, size: 80, icon: Bell },
  { kind: "badge", x: 330, y: -400, size: 78, label: "5" },
  { kind: "badge", x: -320, y: -425, size: 80, icon: ShoppingBag },
  { kind: "badge", x: -110, y: 240, size: 80, label: "2" },
  { kind: "badge", x: 405, y: -150, size: 76, icon: Bell },
];

/** Cada vez más seguidas: el caos se multiplica. */
const appearAt = (index: number) =>
  10 + Math.round(78 * Math.sqrt(index / (NOTIFICATIONS.length - 1)));

const COUNTS = [1, 2, 4, 6, 9, 13, 17, 23, 30, 38, 47, 58, 70, 84, 99];

const NotificationView: React.FC<{ item: Notification }> = ({ item }) => {
  if (item.kind === "toast") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "14px 30px 14px 14px",
          borderRadius: radii.pill,
          backgroundColor: colors.surface,
          boxShadow: shadows.card,
          whiteSpace: "nowrap",
          fontFamily: fonts.family,
          fontWeight: fonts.weights.bold,
          fontSize: 30,
          color: colors.ink,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            backgroundColor: colors.alert,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <DrawIcon
            icon={item.icon}
            size={30}
            color={colors.surface}
            strokeWidth={2.4}
          />
        </div>
        {item.label}
      </div>
    );
  }
  return (
    <div
      style={{
        width: item.size,
        height: item.size,
        borderRadius: "50%",
        backgroundColor: colors.alert,
        border: `6px solid ${colors.surface}`,
        boxShadow: shadows.alert,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: fonts.family,
        fontWeight: fonts.weights.extrabold,
        fontSize: item.size * 0.42,
        color: colors.surface,
      }}
    >
      {item.icon ? (
        <DrawIcon
          icon={item.icon}
          size={item.size * 0.46}
          color={colors.surface}
          strokeWidth={2.5}
        />
      ) : (
        item.label
      )}
    </div>
  );
};

export const Scene1Caos: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { pick } = useLayout();

  const center = pick({ x: 540, y: 700 }, { x: 1390, y: 540 });
  const tileSize = pick(340, 320);

  const tileIn = springAt(frame, fps, 0, springs.bouncy);
  const iconDraw = springAt(frame, fps, 4, springs.smooth, 26);

  // Estrés creciente: el local tiembla cada vez más.
  const stress = interpolate(frame, [34, 96], [0, 1], clamp);
  const shakeRotation = Math.sin(frame * 1.9) * 4 * stress;
  const shakeX = Math.sin(frame * 2.7 + 1) * 8 * stress;

  const visible = NOTIFICATIONS.filter((_, i) => frame >= appearAt(i)).length;
  const lastAppear = visible > 0 ? appearAt(visible - 1) : 0;
  const counterIn = springAt(frame, fps, appearAt(0), springs.pop);
  const counterBump = springAt(frame, fps, lastAppear, springs.pop);
  const count = visible > 0 ? COUNTS[visible - 1] : 0;

  return (
    <SceneContainer durationInFrames={durationInFrames}>
      <AbsoluteFill>
        {/* Notificaciones */}
        {NOTIFICATIONS.map((item, index) => {
          const start = appearAt(index);
          const pop = springAt(frame, fps, start, springs.pop);
          const burst = springAt(
            frame,
            fps,
            98 + index * 0.6,
            springs.smooth,
            10,
          );
          const wobble = Math.sin((frame - start) * 0.45 + index) * 7 * stress;
          const travel = 0.35 + 0.65 * pop;
          return (
            <div
              key={index}
              style={{
                position: "absolute",
                left: center.x + item.x * travel,
                top: center.y + item.y * travel,
                opacity: fadeFrom(pop, 0.3) * (1 - burst),
                transform: makeTransform([
                  translate("-50%", "-50%"),
                  scale(Math.max(0, pop) * (1 + 0.35 * burst)),
                  rotate(wobble),
                ]),
              }}
            >
              <NotificationView item={item} />
            </div>
          );
        })}

        {/* Local / mostrador */}
        <div
          style={{
            position: "absolute",
            left: center.x,
            top: center.y,
            transform: makeTransform([
              translate("-50%", "-50%"),
              translate(shakeX, 0),
              scale(tileIn),
              rotate(shakeRotation),
            ]),
          }}
        >
          <IconTile
            icon={Store}
            size={tileSize}
            iconSize={tileSize * 0.56}
            color={colors.ink}
            strokeWidth={1.6}
            radius={radii.xl}
            shadow={shadows.lifted}
            draw={iconDraw}
          >
            <div
              style={{
                position: "absolute",
                top: -34,
                right: -34,
                minWidth: 108,
                height: 108,
                padding: "0 18px",
                borderRadius: radii.pill,
                backgroundColor: colors.alert,
                border: `7px solid ${colors.surface}`,
                boxShadow: shadows.alert,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: fonts.family,
                fontWeight: fonts.weights.extrabold,
                fontSize: count >= 99 ? 38 : 46,
                color: colors.surface,
                transform: makeTransform([
                  scale(Math.max(0, counterIn) * (1 + 0.3 * (1 - counterBump))),
                ]),
              }}
            >
              {count >= 99 ? "99+" : count}
            </div>
          </IconTile>
        </div>

        {/* Texto */}
        <div
          style={pick<React.CSSProperties>(
            { position: "absolute", left: 70, right: 70, top: 1215 },
            {
              position: "absolute",
              left: 130,
              width: 820,
              top: 0,
              bottom: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            },
          )}
        >
          <SpringText
            text={"Tu negocio necesita\nrepartidores…"}
            fontSize={pick(80, 84)}
            align={pick("center", "left")}
            delay={16}
            stagger={3}
          />
          <SpringText
            text="¿y ahora qué?"
            fontSize={pick(112, 112)}
            align={pick("center", "left")}
            color={colors.accent}
            delay={50}
            stagger={5}
            config={springs.bouncy}
            style={{ marginTop: pick(26, 22) }}
          />
        </div>
      </AbsoluteFill>
    </SceneContainer>
  );
};

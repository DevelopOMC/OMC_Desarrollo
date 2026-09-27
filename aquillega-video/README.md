# AquíLLega · Anuncio para negocios (Remotion)

Vídeo de motion graphics de **30 s a 30 fps** para captar negocios locales
(bares, restaurantes, farmacias, tiendas) para AquíLLega. Está hecho con
**Remotion 4 + React + TypeScript**: todo es vectorial y cada texto, icono,
color y frame se controla desde código.

| Composición      | Formato            | Uso                                  |
| ---------------- | ------------------ | ------------------------------------ |
| `NegocioAd`      | 1080×1920 (9:16)   | Reels, TikTok, Stories, Shorts       |
| `NegocioAd-16x9` | 1920×1080 (16:9)   | YouTube, web, presentaciones         |

Ambas usan exactamente los mismos componentes; cada escena lee el tamaño del
vídeo (`useLayout`) y solo cambia la disposición. Además, en las carpetas
`Escenas-9x16` y `Escenas-16x9` del Studio hay una composición por escena
para revisarlas por separado.

## Puesta en marcha

Requisitos: Node.js 18 o superior y conexión a Internet (las fuentes se cargan
de Google Fonts al previsualizar y al renderizar).

```console
cd aquillega-video
npm install
npm run dev          # = npx remotion studio
```

Remotion Studio se abre en `http://localhost:3000`. Elige `NegocioAd` o
`NegocioAd-16x9` en la barra lateral y pulsa la barra espaciadora para
reproducir.

## Render del MP4 final

```console
# 9:16 (vertical)
npx remotion render NegocioAd out/aquillega-negocio-9x16.mp4

# 16:9 (horizontal)
npx remotion render NegocioAd-16x9 out/aquillega-negocio-16x9.mp4
```

Atajos equivalentes: `npm run render:vertical`, `npm run render:horizontal`
o `npm run render` (los dos seguidos). Los MP4 salen en H.264 + AAC en la
carpeta `out/` (ignorada por git).

Opciones útiles:

```console
# Más calidad / archivo más grande (CRF: 1 mejor … 51 peor; por defecto 18)
npx remotion render NegocioAd out/aquillega-negocio-9x16.mp4 --crf=14

# Borrador rápido a media resolución
npx remotion render NegocioAd out/borrador.mp4 --scale=0.5

# Una escena suelta o un fotograma concreto (miniatura)
npx remotion render Escena4-Ruta out/escena4.mp4
npx remotion still NegocioAd out/portada.png --frame=870
```

## Guion y timing (30 fps)

| Escena | Frames  | Tiempo  | Contenido                                                                 |
| ------ | ------- | ------- | ------------------------------------------------------------------------- |
| 1      | 0–120   | 0–4 s   | Local con notificaciones rojas que se multiplican · "Tu negocio necesita repartidores… ¿y ahora qué?" |
| 2      | 120–300 | 4–10 s  | Smartphone → logo (morph con `interpolatePath`) · 3 pasos de alta con checks (stagger 10 frames) |
| 3      | 300–480 | 10–16 s | Comisiones bajas · sin cuota mensual · bolsa → tienda · contador 0 → 20 min |
| 4      | 480–660 | 16–22 s | Ruta que se dibuja con `stroke-dashoffset` · badge de repartidor verificado |
| 5      | 660–810 | 22–27 s | Mapa de España con 15 ciudades que se iluminan y laten                     |
| 6      | 810–900 | 27–30 s | Logo que se ensambla · CTA "Registrar mi negocio" · aquillega.es            |

Los rangos viven en `src/timeline.ts`. Cada escena termina con una salida de
10 frames (`EXIT_FRAMES`) hecha con `spring()`.

## Estructura

```
src/
├── Root.tsx               Registro de composiciones (completas + por escena)
├── NegocioAd.tsx          Composición principal: fondo + 6 <Sequence> + música
├── ScenePreview.tsx       Envoltorio para ver cada escena aislada
├── theme.ts               Design tokens: colores, tipografía, radios, sombras, springs
├── timeline.ts            Frames de cada escena, formatos y duración
├── audio/Soundtrack.tsx   <Audio> de @remotion/media con fundidos
├── components/            Fondo, textos con spring, iconos, logo, pasos con check…
├── scenes/                Scene1Caos … Scene6Cta
├── data/                  Mapa de España (generado) y ciudades
└── lib/                   Helpers de animación y de layout
scripts/
├── generate-spain-map.mjs          Genera src/data/spain-map.ts (Natural Earth)
└── generate-placeholder-music.mjs  Genera la pista provisional
public/audio/musica-corporativa.mp3 Música (provisional)
```

## Diseño

- **Colores** (`src/theme.ts`): verde `#2E9E5B`, naranja `#F5942A`, fondo
  crema `#FAF7F2`, más tonos derivados (tinta, verdes claros, rojo de
  notificación solo para la escena del caos).
- **Tipografía**: Sora 500–800 vía `@remotion/google-fonts` (la misma de
  aquillega.es).
- **Iconos**: `lucide-react`, animados como vectores (trazo que se dibuja con
  `stroke-dashoffset`, escalas, giros y cross-fades con `spring()`).
- **Logo**: isotipo vectorizado del logo de aquillega.es en `components/Logo.tsx`
  (silueta completa + piezas para el ensamblado). El degradado se define en
  `logoGradient` (hay una línea comentada con el degradado original de la web).
- **Animación**: todas las entradas, salidas y rebotes usan `spring()` con las
  configuraciones de `springs` en `theme.ts`; los transforms se componen con
  `makeTransform()` de `@remotion/animation-utils`. `interpolate()` se usa
  donde el guion lo pide (contador 0 → 20 min y dibujo de la ruta).

## Música

La pista está en `public/audio/musica-corporativa.mp3` y se carga en
`src/audio/Soundtrack.tsx` (constante `MUSIC_FILE`).

El archivo actual es un **placeholder** sintetizado por código (120 BPM; los
cortes de escena caen a tempo). Para usar la pista definitiva, sustitúyelo por
una pista up-tempo corporativa con licencia con el mismo nombre, o cambia
`MUSIC_FILE`. Si modificas el timing, puedes regenerar el placeholder con
`npm run generate:music`.

## Otros comandos

```console
npm run lint           # ESLint + comprobación de tipos
npm run generate:map   # Regenera el mapa de España
npm run generate:music # Regenera la música provisional
```

## Licencia de Remotion

Remotion es gratuito para particulares y empresas de hasta 3 personas; por
encima se necesita una licencia de empresa:
https://github.com/remotion-dev/remotion/blob/main/LICENSE.md

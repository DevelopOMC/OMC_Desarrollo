# Aptoa · Vídeo promocional (Remotion)

Vídeo de 30 s (1920×1080, 30 fps) para [aptoa.es](https://aptoa.es), animado con
[Remotion](https://remotion.dev) a partir del contenido, la paleta y la tipografía
(Plus Jakarta Sans) de la web.

Render final: `out/aptoa-promo-30s-web.mp4`

## Guion

| Tiempo | Escena | Mensaje |
| --- | --- | --- |
| 0:00 | Gancho | «Tu autoescuela, sin papeles, ni Excel, ni WhatsApps.» — el caos desaparece palabra a palabra |
| 0:04.5 | Marca | Revelado del icono y del logotipo · «Software de gestión para autoescuelas» |
| 0:06.5 | Plataforma | «Todo lo que tu academia necesita, conectado.» RouteBook · DriveIQ · App del alumno · Cobros |
| 0:09.5 | Smart Import | «Todos tus datos, en segundos. No en semanas.» |
| 0:12.5 | DriveIQ | «Anticipa quién va a abandonar antes de que ocurra.» + alerta de abandono |
| 0:16.5 | RouteBook | «Tu flota y tus clases, solas.» + confirmación con un clic |
| 0:20.5 | App del alumno | «Una app para que tus alumnos aprueben de verdad.» |
| 0:23.5 | Prueba social | +320 autoescuelas · caso de éxito de Laura Fernández |
| 0:26.5 | CTA | «Digitaliza tu autoescuela en segundos.» · Empieza gratis en aptoa.es |

## Uso

```bash
npm install
npm run dev          # Remotion Studio
npm run soundtrack   # regenera public/audio/aptoa-soundtrack.wav (Python 3 + numpy + scipy)
npm run render       # out/aptoa-promo-30s.mp4
```

## Estructura

- `src/cues.json` — línea de tiempo única (escenas, transiciones y eventos). La
  usan tanto la animación como el generador de audio, por eso imagen y sonido van
  sincronizados.
- `src/scenes/` — una escena por archivo.
- `src/components/` — logotipo vectorial, texto con revelado, transiciones con
  desenfoque de movimiento, dispositivos y UI.
- `scripts/generate_soundtrack.py` — música (120 BPM) y diseño sonoro sintetizados
  desde cero, sin samples de terceros.
- `scripts/stills.mjs` — renderiza fotogramas sueltos para revisión.

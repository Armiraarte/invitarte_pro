# Plantilla HTML/CSS/JS

Esta carpeta es la base estatica de las invitaciones nuevas del sistema. No usa React, Vite ni build.

## Como usarla

1. Copia toda la carpeta `plantilla`.
2. Edita `script.js` y cambia `INVITATION_CONFIG`.
3. Ajusta `styles.css` o `index.html` si quieres personalizar estructura y estilos.
4. Si vas a usar fotos propias, guardalas en `plantilla/invitacion/` y referencia rutas como `./invitacion/foto1.jpg`.
5. Sube la carpeta tal cual o comprime el proyecto en ZIP para subirlo al panel.

## Abrirla en local

Puedes abrir `index.html` directo o servir la carpeta con un servidor estatico:

```powershell
php -S 127.0.0.1:8010
```

Luego abre `http://127.0.0.1:8010/index.html`.

## Que editar

- `script.js`: textos, fecha, colores, itinerario, galeria, mesa de regalos, WhatsApp, musica y portada.
- `styles.css`: look & feel.
- `index.html`: estructura visual y bloques.

## Integracion con el panel

- El panel ahora puede leer `INVITATION_CONFIG` desde `script.js`.
- El backend publica esta invitacion copiando archivos estaticos al `dist`, sin `npm install` ni `npm run build`.

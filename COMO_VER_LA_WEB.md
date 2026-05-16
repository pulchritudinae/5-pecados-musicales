# Cómo ver la web nueva de 5PM sin perderte

## Lo más fácil

1. En GitHub, entra en el repositorio.
2. Pulsa el botón verde **Code**.
3. Pulsa **Download ZIP**.
4. Descomprime el ZIP.
5. Abre el archivo `index.html`.

## Si quieres que se abra con servidor sin escribir comandos

- En Mac: doble clic en `ABRIR_WEB.command`.
- En Windows: doble clic en `ABRIR_WEB.bat`.

Eso abrirá `http://localhost:4173` automáticamente si Python está instalado. Si no se abre, igualmente puedes abrir `index.html` directamente.

Con esta versión, el HTML ya carga los archivos desde estas carpetas:

- `styles/styles.css`
- `scripts/three-scene.js`
- `scripts/app.js`

Si al abrirlo sigues viendo la versión antigua, casi seguro estás abriendo otra carpeta vieja del proyecto.

---

## Cómo reconocer la versión nueva

Abre `index.html` con un editor de texto y busca:

```html
<canvas id="hero-canvas" class="hero-canvas" aria-hidden="true"></canvas>
```

Si eso aparece, tienes la versión nueva.

Si no aparece, tienes la versión antigua.

---

## Si usas GitHub Pages

Después de hacer **Merge pull request**, ve a:

```text
Settings → Pages
```

Comprueba que GitHub Pages está desplegando la rama correcta, normalmente:

```text
Branch: main
Folder: /root
```

Luego abre la web en ventana de incógnito o fuerza recarga:

- Mac: `Cmd + Shift + R`
- Windows/Linux: `Ctrl + Shift + R`

---

## Si quieres usar servidor local

Esto es opcional, pero es la forma más fiable.

Dentro de la carpeta donde está `index.html`, ejecuta:

```bash
python3 -m http.server 4173
```

Luego abre:

```text
http://localhost:4173
```

---

## Mensaje para pegarle a Codex el martes

Pega esto tal cual:

```text
Estoy trabajando en el repo 5-pecados-musicales. Ya hay una PR mergeada que añade la landing inmersiva con Three.js. Necesito que compruebes por qué no estoy viendo la versión nueva en mi ordenador o en GitHub Pages. Por favor:

1. Comprueba que mi carpeta local contiene el commit que añade `<canvas id="hero-canvas">` en `index.html`.
2. Comprueba que `index.html` carga `styles/styles.css`, `scripts/three-scene.js` y `scripts/app.js`.
3. Si falta el commit, ayúdame a hacer `git pull` desde la rama correcta.
4. Si uso GitHub Pages, comprueba que Pages despliega la rama correcta, normalmente `main` y `/root`.
5. Si el navegador cachea la versión antigua, ayúdame a hacer hard refresh o probar en incógnito.
6. Finalmente abre la web con un servidor local (`python3 -m http.server 4173`) y confirma que se ve el hero nuevo.
No cambies diseño todavía; solo ayúdame a ver la versión nueva correctamente.
```

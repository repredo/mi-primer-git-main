# Guía de siguientes pasos

Taller «GitHub para diseñadores», Interface School.

En la app recorriste el flujo completo con tu agente. Creaste un repositorio, lo conectaste a GitHub, hiciste un commit en una rama y llevaste tu cambio a main con una pull request (PR, la propuesta de cambio que otra persona revisa antes de integrarla). Esta guía te ayuda a repetir ese flujo en tu trabajo.

Cada paso trae lo mismo que la app. Primero el **prompt para tu agente** (Cursor o Claude Code), que puedes copiar tal cual. Después **lo que ejecuta el agente**, para que entiendas qué hace con tu proyecto. No necesitas escribir los comandos tú, pero sí saber leerlos.

> Tus repositorios de práctica son públicos. No subas datos de clientes ni información confidencial.

## 1. Termina lo que te faltó

Si no alcanzaste a abrir tu PR en el taller, vuelve a la app. Abre `index.html` con doble clic y sigue desde el paso donde quedaste. Tu progreso se guarda en el navegador.

Cuando tengas tu PR, copia su enlace. Ese enlace es la evidencia del taller.

**Prompt para tu agente**

```text
Revisa en qué estado está mi proyecto. Dime si ya tiene repositorio de Git, si está conectado a GitHub, en qué rama estoy y si hay una PR abierta. Según eso, dime cuál de los 4 pasos de la app me falta y ayúdame a terminarlo. Al final dame el enlace de mi PR.
```

**Lo que ejecuta el agente**

```bash
git status
git remote -v
git branch
gh pr list --author @me
gh pr view --web
```

## 2. Revisa el PR de otra persona

Revisar es tan importante como proponer. Tu criterio de diseño ahorra iteraciones al equipo. Elige el PR de otra persona del taller y déjale al menos un comentario concreto con tres partes: qué funciona, qué cambiarías y por qué.

**Prompt para tu agente**

```text
Quiero revisar esta pull request de otra persona: <pega aquí el enlace de la PR>. Clona su repositorio en una carpeta aparte para no tocar mi proyecto, abre la rama de la PR y explícame el diff en lenguaje simple. Después ayúdame a redactar un comentario con tres partes: qué funciona, qué cambiaría y por qué. Muéstrame el comentario antes de publicarlo.
```

**Lo que ejecuta el agente**

```bash
gh repo clone usuario/mi-primer-git revision-usuario
cd revision-usuario
gh pr checkout 12
gh pr diff 12
gh pr review 12 --comment --body "Funciona... Cambiaría... Porque..."
```

Si el cambio está listo, la revisión puede ser `--approve`. Si hace falta un ajuste antes de integrarlo, usa `--request-changes`. Una captura del antes y el después hace tu comentario mucho más claro.

## 3. Publica con GitHub Pages

GitHub Pages convierte tu repositorio en una página con URL pública. Esta app no necesita build, así que se publica tal cual desde `main`.

**Prompt para tu agente**

```text
Publica este repositorio con GitHub Pages desde la rama main y la carpeta raíz. Cuando termine, dame la URL pública y espera a que responda antes de decirme que está lista.
```

**Lo que ejecuta el agente**

```bash
gh api -X POST "repos/{owner}/{repo}/pages" -f "source[branch]=main" -f "source[path]=/"
gh api "repos/{owner}/{repo}/pages" --jq .html_url
```

Si prefieres hacerlo en GitHub, entra a **Settings > Pages**. En **Source** elige **Deploy from a branch**, en **Branch** elige `main` y la carpeta `/ (root)`, y selecciona **Save**. La URL queda de la forma `https://tu-usuario.github.io/mi-primer-git/`. Si ves un error 404, espera dos minutos y recarga.

### La opción de Vercel, con enlace de prueba por PR

Así trabaja Sho. Conectas el repositorio a Vercel una sola vez, y desde ahí cada PR recibe su propio enlace de prueba. Revisas el cambio funcionando en ese enlace antes de integrarlo a main, y main queda publicada en la URL principal.

**Prompt para tu agente**

```text
Conecta este repositorio a Vercel para que cada pull request tenga un enlace de prueba y main se publique en producción. Es un sitio estático sin build. Cuando termine, dame la URL de producción y explícame dónde voy a ver el enlace de prueba de cada PR.
```

**Lo que ejecuta el agente**

```bash
npx vercel login
npx vercel link
npx vercel git connect
npx vercel --prod
```

También puedes importarlo desde [vercel.com/new](https://vercel.com/new) eligiendo tu repositorio. Desde ese momento, Vercel deja un comentario en cada PR con su enlace de prueba.

## 4. Tu primer cambio en el repositorio de tu equipo

El objetivo es un cambio pequeño en un repositorio real, con el mismo flujo de la app. Antes de empezar, haz dos cosas.

1. **Pide el repositorio correcto.** Pregunta a alguien de desarrollo cuál repositorio contiene la parte que diseñas (textos, iconos, estilos o documentación).
2. **Pide el acceso justo.** Para proponer cambios sin integrarlos basta con permiso de escritura (rol **Write**). Pregunta también si el equipo tiene reglas para nombrar ramas.

Elige un cambio de bajo riesgo, como un texto de interfaz, un error ortográfico o una línea del README. Evita archivos que no entiendas.

**Prompt para tu agente**

```text
Clona el repositorio <organización/repositorio> y crea una rama nueva desde main con un nombre corto que describa el cambio. Quiero cambiar <describe el cambio pequeño>. Antes de tocar nada, muéstrame qué archivo vas a cambiar y por qué. Haz un solo commit con un mensaje que diga qué cambió y para qué. Abre una pull request pequeña con una descripción que explique el problema, el cambio, cómo probarlo y qué revisar, y pide revisión a <usuario de GitHub de la persona dueña de esa parte>. No hagas merge.
```

**Lo que ejecuta el agente**

```bash
gh repo clone organizacion/repositorio
cd repositorio
git switch -c corrige-texto-boton-pago
git add src/components/BotonPago.tsx
git commit -m "Corrige el texto del botón de pago para que diga la acción completa"
git push -u origin corrige-texto-boton-pago
gh pr create --base main --title "Corrige el texto del botón de pago" --body "Problema, cambio, cómo probarlo y qué revisar" --reviewer usuario-revisor
```

Deja que la persona dueña de esa parte haga el merge si así trabaja el equipo. Una PR pequeña se revisa en minutos. Una grande se queda esperando.

## 5. Si aparece un conflicto

Un conflicto pasa cuando tu rama y main cambiaron las mismas líneas. No es un error tuyo ni se pierde nada. GitHub frena la integración, te muestra las dos versiones y tú eliges con cuál quedarte, o las combinas.

**Prompt para tu agente**

```text
Hay un conflicto en mi PR. Muéstrame las dos versiones y explícame la diferencia antes de resolverlo.
```

Cuando entiendas las dos versiones, dile al agente cuál conservar o cómo combinarlas. Pídele que te muestre el resultado antes de subirlo.

**Lo que ejecuta el agente**

```bash
gh pr checkout 12
git fetch origin
git merge origin/main
git status
git diff
git add archivo-con-conflicto.html
git commit -m "Resuelve el conflicto con main conservando el texto nuevo del título"
git push
```

Después de resolverlo, vuelve a probar tu cambio, en local o en el enlace de prueba, antes de integrarlo.

## 6. Buenas prácticas para repos colaborativos

### Para quienes colaboran

1. **Acordar el objetivo antes de editar.** Dejar escrito qué problema se resuelve, qué queda fuera y cómo comprobar el resultado. Puede ser en una tarea de GitHub (*issue*) enlazada al cambio.
2. **Crear una rama por cambio coherente.** Por ejemplo, `ajustar-contraste-alertas`. No una por archivo, ni una sola para mezclar trabajos independientes.
3. **Proponer cambios pequeños y enfocados.** Un pull request (PR, propuesta de cambio) debería tener un propósito claro. No mezclar corregir un color con reorganizar todo el proyecto.
4. **Escribir commits que expliquen el cambio.** Un commit es un cambio guardado en el historial. Mejor «Mejora el contraste del texto de error» que «cambios finales». Un PR puede contener varios commits.
5. **Preparar el PR para quien lo revisa.** Explicar el problema, qué cambió, por qué y qué se comprobó. En diseño, añadir capturas antes/después y el enlace de Figma cuando ayuden. Revisar primero los propios cambios; si están incompletos, marcar el PR como borrador.
6. **Revisar con comentarios concretos.** Explicar el problema y su efecto, distinguir lo que impide aprobar de una sugerencia opcional y pedir contexto si algo no se entiende. «Se ve bien» no sustituye una revisión.
7. **Integrar después de la revisión acordada.** Que el botón de *merge* (integrar el cambio) esté disponible no significa que ya esté aprobado. El autor puede integrarlo después de la aprobación si las reglas del equipo lo permiten.
8. **Resolver conflictos conversando.** Si dos cambios se cruzan, coordinar qué resultado conservar; no elegir automáticamente «mi versión». Si no se entiende el archivo, pedir apoyo técnico y comprobar de nuevo el resultado.
9. **No subir información sensible.** Tampoco en capturas o comentarios. Borrar una contraseña del archivo no la elimina del historial: si se expone, hay que avisar y revocarla o reemplazarla.

### Para quien es dueño del repositorio

1. **Documentar cómo empezar.** Mantener un `README` que explique para qué sirve el proyecto, cómo usarlo y a quién pedir ayuda. Otra persona debería poder orientarse sin depender de una llamada contigo.
2. **Dejar claras las reglas para contribuir.** En `CONTRIBUTING.md`, explicar cómo proponer cambios, nombrar ramas, comprobar el resultado y pedir revisión. Una plantilla de pull request (PR, propuesta de cambio) ayuda a recoger objetivo, capturas y comprobaciones sin repetir instrucciones.
3. **Dar únicamente los permisos necesarios.** No todas las personas necesitan administrar el repositorio. Revisar los accesos y retirarlos cuando alguien deja el equipo o termina su colaboración.
4. **Proteger la rama principal.** Configurar protección de ramas o conjuntos de reglas para exigir propuestas de cambio, revisiones y comprobaciones antes de integrar. Evitar que alguien pueda borrar o sobrescribir el historial compartido accidentalmente. Las opciones disponibles dependen del plan y del tipo de repositorio.
5. **Aplicarse las mismas reglas.** Que seas el dueño no significa que debas saltarte la revisión. Las excepciones urgentes deben tener una razón y quedar documentadas.
6. **Definir quién revisa y quién integra.** Cada propuesta necesita una persona responsable de revisarla. En equipos más grandes, `CODEOWNERS` permite señalar responsables por archivos o carpetas; las aprobaciones obligatorias deben configurarse además en las reglas del repositorio.
7. **Atender las contribuciones.** Dar contexto cuando pides cambios o rechazas una propuesta. Si no puedes revisarla todavía, decirlo y acordar cuándo retomarla. Evitar que las propuestas queden abiertas indefinidamente sin respuesta.
8. **Configurar controles proporcionales al proyecto.** Por ejemplo, comprobar enlaces, validar archivos de estilos o ejecutar pruebas antes de integrar. La automatización debe detectar problemas reales; no añadir requisitos que nadie entiende ni mantiene.
9. **Cuidar la seguridad y la confidencialidad.** Definir qué puede publicarse, activar las protecciones disponibles contra credenciales expuestas y establecer cómo reportar un incidente. Un repositorio privado también necesita controles de acceso.
10. **Mantener el repositorio ordenado.** Actualizar instrucciones, cerrar tareas resueltas y eliminar ramas terminadas cuando ya no se necesiten. Si el proyecto deja de mantenerse, indicarlo y considerar archivarlo.

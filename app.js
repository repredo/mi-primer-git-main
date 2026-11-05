const STEPS = [
  {
    tab: "Crea tu proyecto",
    title: "Crea tu proyecto y ponle Git",
    concept: "<strong>Un repositorio</strong> guarda los archivos de tu proyecto y todo su historial.",
    why: "Descargaste esta app como ZIP desde GitHub (Code > Download ZIP), así que tu carpeta todavía no tiene historial. Con Git empieza a recordar cada cambio y, si algo se rompe, puedes volver a un punto que funcionaba.",
    prompt: "Descargué este proyecto como ZIP y lo descomprimí. Estoy en su carpeta. Inicializa un repositorio de Git con la rama principal llamada main, revisa que exista un .gitignore básico y guarda el punto de partida con un commit. Después explícame en dos frases qué es un repositorio y qué archivos quedaron fuera del historial.",
    command: "git init -b main\ngit add .\ngit commit -m \"Punto de partida del proyecto\"\ngit status",
    tip: "Abre la carpeta correcta antes de pedirle algo al agente. Git solo registra lo que está dentro de ella.",
    mascot: "¡Hola! Soy Git. Vamos a darle memoria a tu proyecto.",
    graph: "main nace con su primer punto en el historial.",
  },
  {
    tab: "Conecta GitHub",
    title: "Conecta GitHub con GitHub CLI",
    concept: "<strong>El remoto</strong> es la copia de tu repositorio en GitHub. Tu computador se sincroniza con ella.",
    why: "Así tu trabajo queda respaldado en la nube y otras personas pueden revisarlo.",
    prompt: "Revisa si tengo GitHub CLI (gh) instalado y, si no, instálalo. Ayúdame a iniciar sesión con gh auth login. Luego crea un repositorio público en GitHub desde esta carpeta, conéctalo como remoto origin y sube lo que hay. Al terminar dame el enlace del repositorio.",
    command: "brew install gh          # en Windows usa winget install GitHub.cli\ngh auth login\ngh repo create mi-primer-git --public --source . --push",
    tip: "Tu repositorio es público para que otras personas puedan abrir el enlace de tu PR. Es público: no subas datos de clientes ni información confidencial.",
    mascot: "Ahora tu proyecto tendrá una copia segura en GitHub.",
    graph: "origin en GitHub guarda una copia de main.",
  },
  {
    tab: "Commit y rama",
    title: "Primer commit y primera rama",
    concept: "<strong>Un commit</strong> registra un conjunto de cambios. <strong>Una rama</strong> te deja trabajar por separado sin tocar main.",
    why: "Pruebas tu idea en un espacio aparte. Si no funciona, main sigue intacta.",
    prompt: "Crea una rama nueva llamada cambio-titulo desde main. Cambia el título principal de index.html por uno con mi nombre. Luego haz un commit con un mensaje que diga qué cambió y para qué. Muéstrame el mensaje antes de confirmarlo y explícame qué diferencia hay ahora entre la rama y main.",
    command: "git switch -c cambio-titulo\ngit add index.html\ngit commit -m \"Cambia el título del inicio para personalizar la app\"",
    tip: "Un buen mensaje dice qué cambió y para qué. Usa una rama por cambio, así cada idea se revisa por separado.",
    mascot: "Una rama es un espacio aparte. Prueba sin miedo.",
    graph: "La rama cambio-titulo sale de main con tu commit.",
  },
  {
    tab: "PR y merge",
    title: "Tu primera PR hasta el merge",
    concept: "<strong>Una pull request (PR)</strong> propone integrar los cambios de una rama a main después de revisarlos.",
    why: "La PR es el momento de mirar el cambio con calma antes de que llegue a la versión principal.",
    prompt: "Sube la rama cambio-titulo a GitHub y abre una pull request hacia main con una descripción que explique qué cambió, por qué y cómo probarlo. Explícame el diff en lenguaje simple. Si el proyecto está conectado a Vercel, dame el enlace de prueba. No hagas merge hasta que yo lo apruebe.",
    command: "git push -u origin cambio-titulo\ngh pr create --base main --title \"Cambia el título del inicio\" --body \"Qué cambió, por qué y cómo probarlo\"\ngh pr diff\ngh pr merge --merge --delete-branch\ngit switch main && git pull",
    tip: "Pide al agente que te explique qué cambió y revisa el resultado, en local o en el enlace de Vercel, antes de integrarlo.",
    mascot: "Revisa antes de integrar. Yo te espero aquí.",
    graph: "La PR lleva tu rama de vuelta a main con un merge.",
  },
];

const STORAGE_KEY = "mi-primer-git:v1";
const DONE_MASCOT = "¡Lo lograste! Tu cambio ya vive en main.";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const state = loadState();

const $ = (id) => document.getElementById(id);
const els = {
  tabs: $("tabs"),
  stepView: $("stepView"),
  doneView: $("doneView"),
  graph: $("graph"),
  caption: $("graphCaption"),
  progressText: $("progressText"),
  progressFill: $("progressFill"),
  progressBar: $("progressBar"),
  bubble: $("bubble"),
  mascot: $("mascot"),
  look: $("mascotLook"),
  announcer: $("announcer"),
};

function loadState() {
  const fallback = { done: [false, false, false, false], active: 0, view: "steps" };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || !Array.isArray(saved.done) || saved.done.length !== STEPS.length) return fallback;
    return {
      done: saved.done.map(Boolean),
      active: Math.min(Math.max(Number(saved.active) || 0, 0), STEPS.length - 1),
      view: saved.view === "done" && saved.done.every(Boolean) ? "done" : "steps",
    };
  } catch {
    return fallback;
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

const doneCount = () => state.done.filter(Boolean).length;

function escapeHtml(text) {
  return text.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);
}

function renderCommand(command) {
  return command
    .split("\n")
    .map((line) => {
      const at = line.indexOf(" #");
      if (at === -1) return escapeHtml(line);
      return escapeHtml(line.slice(0, at)) + `<span class="c">${escapeHtml(line.slice(at))}</span>`;
    })
    .join("\n");
}

function renderTabs() {
  els.tabs.innerHTML = STEPS.map((step, i) => {
    const selected = state.view === "steps" && i === state.active;
    const done = state.done[i];
    return `<button class="tab${done ? " is-done" : ""}" role="tab" id="tab-${i}" data-index="${i}"
      aria-selected="${selected}" aria-controls="stepView" tabindex="${selected || (state.view === "done" && i === 0) ? 0 : -1}"
      aria-label="Paso ${i + 1}, ${step.title}${done ? ", hecho" : ""}">
      <span class="tab-num">${done ? '<i class="ph ph-check" aria-hidden="true"></i>' : i + 1}</span>
      <span class="tab-label">${step.tab}</span>
    </button>`;
  }).join("");
}

function renderStep() {
  const i = state.active;
  const step = STEPS[i];
  const isLast = i === STEPS.length - 1;
  els.stepView.innerHTML = `
    <p class="step-kicker">Paso ${i + 1} de ${STEPS.length}</p>
    <h2>${step.title}</h2>
    <p class="concept">${step.concept}</p>
    <p class="muted">${step.why}</p>

    <div class="block">
      <div class="block-head">
        <span class="block-label"><i class="ph ph-chat-circle-text" aria-hidden="true"></i>Prompt para tu agente</span>
        <button class="copy-btn" type="button" data-copy="prompt"><i class="ph ph-copy" aria-hidden="true"></i><span>Copiar</span></button>
      </div>
      <p class="prompt">${escapeHtml(step.prompt)}</p>
    </div>

    <div class="block">
      <div class="block-head">
        <span class="block-label"><i class="ph ph-terminal-window" aria-hidden="true"></i>Lo que ejecuta el agente</span>
        <button class="copy-btn" type="button" data-copy="command"><i class="ph ph-copy" aria-hidden="true"></i><span>Copiar</span></button>
      </div>
      <pre class="code"><code>${renderCommand(step.command)}</code></pre>
    </div>

    <div class="tip">
      <i class="ph ph-lightbulb" aria-hidden="true"></i>
      <p><strong>Buena práctica.</strong> ${step.tip}</p>
    </div>

    <div class="step-foot">
      <label class="check">
        <input type="checkbox" id="doneCheck" ${state.done[i] ? "checked" : ""}>
        <span class="check-box"><i class="ph ph-check" aria-hidden="true"></i></span>
        Lo hice
      </label>
      <div class="nav">
        <button class="btn" type="button" data-nav="-1" ${i === 0 ? "disabled" : ""}><i class="ph ph-arrow-left" aria-hidden="true"></i>Anterior</button>
        ${isLast && doneCount() === STEPS.length
          ? '<button class="btn btn-primary" type="button" data-nav="finish">Ver resultado<i class="ph ph-arrow-right" aria-hidden="true"></i></button>'
          : `<button class="btn btn-primary" type="button" data-nav="1" ${isLast ? "disabled" : ""}>Siguiente<i class="ph ph-arrow-right" aria-hidden="true"></i></button>`}
      </div>
    </div>`;
}

function renderGraph(stage) {
  els.graph.querySelectorAll("[data-s]").forEach((el) => {
    el.classList.toggle("is-on", Number(el.dataset.s) <= stage);
  });
}

function renderProgress() {
  const count = doneCount();
  els.progressText.textContent = `${count} de ${STEPS.length} completados`;
  els.progressFill.style.width = `${(count / STEPS.length) * 100}%`;
  els.progressBar.setAttribute("aria-valuenow", String(count));
}

function setBubble(text) {
  if (els.bubble.textContent === text) return;
  if (reduceMotion.matches || !els.bubble.textContent) {
    els.bubble.textContent = text;
    return;
  }
  els.bubble.classList.add("is-swapping");
  setTimeout(() => {
    els.bubble.textContent = text;
    els.bubble.classList.remove("is-swapping");
  }, 180);
}

function enter(view) {
  if (reduceMotion.matches) return;
  view.classList.remove("is-entering");
  void view.offsetWidth;
  view.classList.add("is-entering");
}

function render({ animate = false } = {}) {
  const finished = state.view === "done";
  renderTabs();
  renderProgress();
  els.stepView.hidden = finished;
  els.doneView.hidden = !finished;
  if (finished) {
    renderGraph(STEPS.length);
    els.caption.textContent = "Tu historial completo. main, una rama y su merge.";
    setBubble(DONE_MASCOT);
    if (animate) enter(els.doneView);
  } else {
    renderStep();
    renderGraph(state.active + 1);
    els.caption.textContent = STEPS[state.active].graph;
    setBubble(STEPS[state.active].mascot);
    if (animate) enter(els.stepView);
  }
  saveState();
}

function goTo(index) {
  state.view = "steps";
  state.active = Math.min(Math.max(index, 0), STEPS.length - 1);
  render({ animate: true });
}

function finish() {
  state.view = "done";
  render({ animate: true });
  celebrate();
  els.doneView.querySelector("h2").focus?.();
}

/* Mascota */
let happyTimer;
function celebrate(ms = 1400) {
  const m = els.mascot;
  m.classList.add("is-happy");
  if (!reduceMotion.matches) {
    m.classList.remove("is-hopping");
    void m.offsetWidth;
    m.classList.add("is-hopping");
  }
  clearTimeout(happyTimer);
  happyTimer = setTimeout(() => m.classList.remove("is-happy"), ms);
}
els.mascot.addEventListener("animationend", () => els.mascot.classList.remove("is-hopping"));
els.mascot.addEventListener("click", () => celebrate(900));

function scheduleBlink() {
  const delay = 2400 + Math.random() * 3200;
  setTimeout(() => {
    if (!reduceMotion.matches && !els.mascot.classList.contains("is-happy")) {
      els.mascot.classList.add("is-blinking");
      setTimeout(() => els.mascot.classList.remove("is-blinking"), 140);
    }
    scheduleBlink();
  }, delay);
}
scheduleBlink();

let lookFrame;
window.addEventListener("pointermove", (event) => {
  cancelAnimationFrame(lookFrame);
  lookFrame = requestAnimationFrame(() => {
    const rect = els.mascot.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const dist = Math.hypot(dx, dy) || 1;
    const reach = Math.min(dist / 120, 1) * 2.4;
    els.look.style.transform = `translate(${(dx / dist) * reach}px, ${(dy / dist) * reach}px)`;
  });
});
document.documentElement.addEventListener("pointerleave", () => {
  els.look.style.transform = "";
});

/* Copiar */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

document.addEventListener("click", async (event) => {
  const btn = event.target.closest("[data-copy]");
  if (!btn) return;
  const kind = btn.dataset.copy;
  const text = kind === "next" ? $("nextPrompt").textContent.trim() : STEPS[state.active][kind];
  const ok = await copyText(text);
  if (!ok) return;
  const label = btn.querySelector("span");
  const icon = btn.querySelector("i");
  btn.classList.add("is-copied");
  label.textContent = "Copiado";
  icon.className = "ph ph-check";
  els.announcer.textContent = kind === "command" ? "Comando copiado" : "Prompt copiado";
  setBubble(kind === "command" ? "¡Copiado! Así se ve lo que hará tu agente." : "¡Copiado! Pégalo en tu agente.");
  celebrate(900);
  clearTimeout(btn._reset);
  btn._reset = setTimeout(() => {
    btn.classList.remove("is-copied");
    label.textContent = "Copiar";
    icon.className = "ph ph-copy";
  }, 1600);
});

/* Navegación y progreso */
els.tabs.addEventListener("click", (event) => {
  const tab = event.target.closest(".tab");
  if (tab) goTo(Number(tab.dataset.index));
});

els.tabs.addEventListener("keydown", (event) => {
  const keys = { ArrowRight: 1, ArrowLeft: -1 };
  if (!(event.key in keys)) return;
  event.preventDefault();
  const current = state.view === "steps" ? state.active : 0;
  goTo((current + keys[event.key] + STEPS.length) % STEPS.length);
  $(`tab-${state.active}`).focus();
});

els.stepView.addEventListener("click", (event) => {
  const nav = event.target.closest("[data-nav]");
  if (!nav) return;
  if (nav.dataset.nav === "finish") finish();
  else goTo(state.active + Number(nav.dataset.nav));
});

let advanceTimer;
els.stepView.addEventListener("change", (event) => {
  if (event.target.id !== "doneCheck") return;
  const i = state.active;
  state.done[i] = event.target.checked;
  renderTabs();
  renderProgress();
  saveState();
  clearTimeout(advanceTimer);
  if (!event.target.checked) {
    renderStep();
    return;
  }
  celebrate();
  els.announcer.textContent = `Paso ${i + 1} hecho`;
  advanceTimer = setTimeout(() => {
    const next = state.done.findIndex((d, j) => !d && j > i);
    const anyLeft = state.done.findIndex((d) => !d);
    if (anyLeft === -1) finish();
    else goTo(next !== -1 ? next : anyLeft);
  }, 550);
});

$("backToSteps").addEventListener("click", () => goTo(STEPS.length - 1));

$("resetBtn").addEventListener("click", () => {
  state.done = STEPS.map(() => false);
  state.active = 0;
  state.view = "steps";
  render({ animate: true });
});

render();

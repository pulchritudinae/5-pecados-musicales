const carousels = document.querySelectorAll("[data-carousel]");
const entryGate = document.querySelector(".entry-gate");
const gateButton = document.querySelector(".gate-button");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealTargets = document.querySelectorAll(".intro-grid, .avatar-feature, .workflow-grid article, .archive-layout");
const urlParams = new URLSearchParams(window.location.search);
const skipIntro = urlParams.get("skipIntro") === "1" || window.location.hash === "#manifiesto";
const adminMode = urlParams.get("admin") === "pulchro";
const avatarLights = {
  ander: "rgba(0, 168, 117, 0.56)",
  asher: "rgba(216, 210, 196, 0.5)",
  leo: "rgba(167, 167, 162, 0.48)",
  kim: "rgba(94, 113, 128, 0.5)",
  bodhi: "rgba(199, 15, 24, 0.58)"
};

document.body.classList.toggle("admin-mode", adminMode);

if (skipIntro && entryGate) {
  entryGate.classList.add("is-hidden");
}

if (!skipIntro && gateButton && entryGate) {
  gateButton.addEventListener("click", () => {
    entryGate.classList.add("is-opening");

    window.setTimeout(() => {
      entryGate.classList.add("is-hidden");
      document.querySelector("#inicio")?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    }, prefersReducedMotion ? 120 : 820);
  });
}

if (!prefersReducedMotion) {
  document.addEventListener("pointermove", (event) => {
    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;
    const root = document.documentElement.style;

    root.setProperty("--cursor-x", `${event.clientX}px`);
    root.setProperty("--cursor-y", `${event.clientY}px`);
    root.setProperty("--hero-x", `${(x * 12).toFixed(2)}px`);
    root.setProperty("--hero-y", `${(y * 8).toFixed(2)}px`);
    root.setProperty("--hero-bg-x", `${(x * -18).toFixed(2)}px`);
    root.setProperty("--hero-bg-y", `${(y * -14).toFixed(2)}px`);
    root.setProperty("--hero-emblem-x", `${(x * 24).toFixed(2)}px`);
    root.setProperty("--hero-emblem-y", `${(y * 18).toFixed(2)}px`);
    root.setProperty("--slab-gold-x", `${(x * -22).toFixed(2)}px`);
    root.setProperty("--slab-gold-y", `${(y * -18).toFixed(2)}px`);
    root.setProperty("--slab-green-x", `${(x * -35).toFixed(2)}px`);
    root.setProperty("--slab-green-y", `${(y * 22).toFixed(2)}px`);
    root.setProperty("--slab-white-x", `${(x * 18).toFixed(2)}px`);
    root.setProperty("--slab-white-y", `${(y * -24).toFixed(2)}px`);
    root.setProperty("--slab-red-x", `${(x * 26).toFixed(2)}px`);
    root.setProperty("--slab-red-y", `${(y * 20).toFixed(2)}px`);
    root.setProperty("--slab-black-x", `${(x * -18).toFixed(2)}px`);
    root.setProperty("--slab-black-y", `${(y * 24).toFixed(2)}px`);
    root.setProperty("--slab-grey-x", `${(x * 30).toFixed(2)}px`);
    root.setProperty("--slab-grey-y", `${(y * -16).toFixed(2)}px`);
  });

  const bindAvatarCursor = (element) => {
    const lightKey = Object.keys(avatarLights).find((key) => element.classList.contains(key));

    if (!lightKey) {
      return;
    }

    element.addEventListener("pointerenter", () => {
      document.documentElement.style.setProperty("--cursor-color", avatarLights[lightKey]);
      document.documentElement.style.setProperty("--cursor-opacity", "1");
    });

    element.addEventListener("pointerleave", () => {
      document.documentElement.style.setProperty("--cursor-opacity", "0");
    });
  };

  document.querySelectorAll(".avatar-feature, .map-card").forEach(bindAvatarCursor);
}

if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealTargets.forEach((target) => {
    target.dataset.reveal = "";
    observer.observe(target);
  });
} else {
  revealTargets.forEach((target) => {
    target.classList.add("is-visible");
  });
}

carousels.forEach((carousel) => {
  const panels = Number(carousel.dataset.panels || 5);
  const track = carousel.querySelector(".carousel-track");
  const frame = carousel.querySelector(".carousel-window");
  const previous = carousel.querySelector(".prev");
  const next = carousel.querySelector(".next");
  const dots = carousel.querySelector(".dots");
  let active = 0;

  carousel.tabIndex = 0;
  track.style.setProperty("--panels", panels);

  const render = () => {
    track.style.setProperty("--active", active);
    dots.querySelectorAll(".dot").forEach((dot, index) => {
      dot.setAttribute("aria-current", String(index === active));
    });
  };

  for (let index = 0; index < panels; index += 1) {
    const dot = document.createElement("button");
    dot.className = "dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Ir al panel ${index + 1}`);
    dot.addEventListener("click", () => {
      active = index;
      render();
    });
    dots.appendChild(dot);
  }

  previous.addEventListener("click", () => {
    active = (active - 1 + panels) % panels;
    render();
  });

  next.addEventListener("click", () => {
    active = (active + 1) % panels;
    render();
  });

  if (!prefersReducedMotion) {
    frame.addEventListener("pointermove", (event) => {
      const rect = frame.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      frame.style.setProperty("--tilt-x", `${((x - 0.5) * 8).toFixed(2)}deg`);
      frame.style.setProperty("--tilt-y", `${((0.5 - y) * 7).toFixed(2)}deg`);
    });

    frame.addEventListener("pointerleave", () => {
      frame.style.setProperty("--tilt-x", "0deg");
      frame.style.setProperty("--tilt-y", "0deg");
    });
  }

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      active = (active - 1 + panels) % panels;
      render();
    }

    if (event.key === "ArrowRight") {
      active = (active + 1) % panels;
      render();
    }
  });

  render();
});

const unlockHero = () => {
  const hero = document.querySelector(".hero");

  if (!hero || hero.classList.contains("is-unlocked")) {
    return;
  }

  hero.classList.remove("is-locking");
  hero.classList.add("is-unlocking");

  window.setTimeout(() => {
    hero.classList.remove("is-unlocking");
    hero.classList.add("is-unlocked");
  }, prefersReducedMotion ? 80 : 1300);
};

if (skipIntro) {
  unlockHero();
} else if (gateButton) {
  gateButton.addEventListener("click", () => {
    window.setTimeout(unlockHero, prefersReducedMotion ? 120 : 880);
  });
} else {
  unlockHero();
}

document.querySelectorAll(".stat-control").forEach((control, index) => {
  const input = control.querySelector('input[type="range"]');
  const output = control.querySelector("output");

  if (!input || !output) {
    return;
  }

  const avatar = control.closest(".avatar-feature");
  const avatarName = avatar?.className.match(/\b(ander|asher|leo|kim|bodhi)\b/)?.[1] || "avatar";
  const storageKey = `5pm-stat-${avatarName}-${index}`;
  let savedValue = null;

  input.disabled = !adminMode;

  if (adminMode) {
    try {
      savedValue = window.localStorage.getItem(storageKey);
    } catch (error) {
      savedValue = null;
    }
  }

  if (savedValue !== null) {
    input.value = savedValue;
  }

  const updateStat = () => {
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const value = Number(input.value || 0);
    const percent = ((value - min) / (max - min)) * 100;

    output.value = value;
    output.textContent = value;
    control.style.setProperty("--stat-percent", `${percent}%`);

    if (adminMode) {
      try {
        window.localStorage.setItem(storageKey, String(value));
      } catch (error) {
        // Some privacy modes block local storage; the visual stat still updates.
      }
    }
  };

  if (adminMode) {
    input.addEventListener("input", updateStat);
  }

  updateStat();
});

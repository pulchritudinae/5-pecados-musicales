(function () {
    // Shared, low-overhead canvas sequence used by the four legacy avatar pages.
    // Loading this before their old inline code makes the old implementation exit.
    const pageConfig = {
        "asher.html": { count: 33, dir: "asher.vid", name: "asher", tint: "rgba(216, 210, 196, 0.10)" },
        "bodhi.html": { count: 121, dir: "bodhi.vid", name: "bodhi", tint: "rgba(178, 16, 30, 0.16)" },
        "kim.html": { count: 121, dir: "kim.vid", name: "kim", tint: "rgba(6, 14, 24, 0.28)" },
        "leo.html": { count: 68, dir: "leo.vid", name: "leo", tint: "rgba(118, 118, 118, 0.18)" }
    };
    const config = pageConfig[location.pathname.split("/").pop()] ;
    if (!config) return;

    window.__optimizedHero = true;

    const canvas = document.getElementById("hero-canvas");
    const ctx = canvas.getContext("2d", { alpha: false });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const loader = document.getElementById("loader");
    const progressFill = document.getElementById("progress-fill");
    const loadingPercent = document.getElementById("loading-percent");
    const mainTitle = document.getElementById("main-title");
    const heroMainText = document.getElementById("hero-main-text");
    const heroSubtitle = document.getElementById("hero-subtitle");
    const frames = [];
    let loadedCount = 0;
    let currentProgress = 0;
    let renderQueued = false;
    let lastRenderedIndex = -1;

    const framePath = (i) => `./images/${config.dir}/${config.name}-animacion-${String(i).padStart(3, "0")}.webp`;

    function preloadFrames() {
        return new Promise((resolve) => {
            let completed = 0;
            const markDone = () => {
                completed++;
                loadedCount++;
                const pct = Math.round((loadedCount / config.count) * 100);
                progressFill.style.width = `${pct}%`;
                loadingPercent.textContent = `${pct}%`;
                if (completed === config.count) resolve();
            };
            for (let i = 1; i <= config.count; i++) {
                const img = new Image();
                let settled = false;
                const done = () => { if (!settled) { settled = true; markDone(); } };
                img.decoding = "async";
                if ("fetchPriority" in img) img.fetchPriority = "high";
                img.onload = () => img.decode ? img.decode().catch(() => {}).finally(done) : done();
                img.onerror = done;
                img.src = framePath(i);
                frames.push(img);
            }
        });
    }

    function resizeCanvas() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        lastRenderedIndex = -1;
    }

    function drawCover(img) {
        if (!img || !img.naturalWidth) return;
        const cw = canvas.clientWidth;
        const ch = canvas.clientHeight;
        const ratio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = cw / ch;
        let dw, dh, dx, dy;
        if (ratio > canvasRatio) {
            dh = ch; dw = ch * ratio; dx = (cw - dw) / 2; dy = 0;
        } else {
            dw = cw; dh = cw / ratio; dx = 0; dy = (ch - dh) / 2;
        }
        const zoom = 1.04;
        dw *= zoom;
        dh *= zoom;
        // Recentrar después del zoom evita que el formato vertical de Kim
        // se desplace hacia arriba/izquierda.
        dx = (cw - dw) / 2;
        dy = (ch - dh) / 2;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, cw, ch);
        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.fillStyle = config.tint;
        ctx.fillRect(0, 0, cw, ch);
    }

    function renderFrame(progress) {
        const index = Math.min(config.count - 1, Math.max(0, Math.round(progress * (config.count - 1))));
        if (index === lastRenderedIndex) return;
        lastRenderedIndex = index;
        drawCover(frames[index]);
    }

    function requestRender() {
        if (renderQueued) return;
        renderQueued = true;
        requestAnimationFrame(() => { renderFrame(currentProgress); renderQueued = false; });
    }

    function setupScrollTrigger() {
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        resizeCanvas();
        renderFrame(0);

        const textTl = gsap.timeline({ paused: true });
        textTl.to(heroMainText, { opacity: 0, y: -58, scale: 0.9, duration: 0.42, ease: "power2.inOut" }, 0.12)
            .to(heroSubtitle, { opacity: 1, y: 0, duration: 0.44, ease: "power2.out" }, 0.2)
            .to(mainTitle, { y: -70, scale: 0.98, duration: 0.72, ease: "none" }, 0.34)
            .to(mainTitle, { opacity: 0, duration: 0.40, ease: "power1.in" }, 0.80);

        ScrollTrigger.create({
            trigger: "#hero-scene", start: "top top", end: "+=130%", pin: true, scrub: 0.6,
            animation: textTl, invalidateOnRefresh: true,
            onUpdate: (self) => { currentProgress = self.progress; requestRender(); }
        });
        ScrollTrigger.refresh();
    }

    window.addEventListener("resize", () => {
        resizeCanvas();
        renderFrame(currentProgress);
        ScrollTrigger.refresh();
    }, { passive: true });

    const timeout = setTimeout(() => {
        loader.classList.add("hidden");
        loader.style.display = "none";
        setupScrollTrigger();
    }, 12000);

    preloadFrames().then(() => {
        clearTimeout(timeout);
        gsap.to(loader, { opacity: 0, duration: 0.8, ease: "power2.out", onComplete: () => {
            loader.classList.add("hidden");
            loader.style.display = "none";
        }});
        setupScrollTrigger();
    });
})();

(function () {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const core = document.querySelector(".character-cursor-core");
    const glow = document.querySelector(".character-cursor-glow");
    const ring = document.querySelector(".character-cursor-ring");
    if (!core || !glow || !ring) return;

    document.body.classList.add("character-cursor-active");
    let targetX = innerWidth / 2, targetY = innerHeight / 2;
    let coreX = targetX, coreY = targetY, glowX = targetX, glowY = targetY, ringX = targetX, ringY = targetY;
    document.addEventListener("pointermove", (event) => { targetX = event.clientX; targetY = event.clientY; }, { passive: true });

    function render() {
        coreX += (targetX - coreX) * 0.34; coreY += (targetY - coreY) * 0.34;
        glowX += (targetX - glowX) * 0.18; glowY += (targetY - glowY) * 0.18;
        ringX += (targetX - ringX) * 0.09; ringY += (targetY - ringY) * 0.09;
        core.style.transform = `translate3d(${coreX}px, ${coreY}px, 0)`;
        glow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0)`;
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
})();

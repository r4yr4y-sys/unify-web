import { useEffect, useRef } from "react";

const PARTICLE_COUNT = 600;

export default function AntigravityBackground() {
  const panelRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const panel = panelRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!panel || !canvas || !context) return undefined;

    let frameId;
    let width = 0;
    let height = 0;
    let particles = [];
    const pointer = { x: 0, y: 0, active: false };

    const createParticles = () => {
      const size = Math.min(width, height);
      particles = Array.from({ length: PARTICLE_COUNT }, () => {
        const angle = Math.random() * Math.PI * 2;
        const radius = size * (0.08 + Math.pow(Math.random(), 0.72) * 0.48);
        const depth = 0.45 + Math.random() * 0.9;
        return {
          angle,
          radius,
          depth,
          phase: Math.random() * Math.PI * 2,
          size: 0.65 + Math.random() * 1.35,
          x: width / 2,
          y: height / 2,
        };
      });
    };

    const resize = () => {
      const bounds = panel.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      createParticles();
    };

    const setPointer = (event) => {
      const bounds = panel.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      pointer.active = true;
    };
    const clearPointer = () => {
      pointer.active = false;
    };

    const render = (time) => {
      const seconds = time / 1000;
      const centerX = width / 2;
      const centerY = height / 2;
      context.clearRect(0, 0, width, height);

      particles.forEach((particle) => {
        const wave =
          Math.sin(seconds * 0.5 + particle.phase) * 8 * particle.depth;
        const targetX =
          centerX + Math.cos(particle.angle) * (particle.radius + wave);
        const targetY =
          centerY + Math.sin(particle.angle) * (particle.radius + wave) * 0.72;
        let pullX = 0;
        let pullY = 0;

        if (pointer.active) {
          const dx = targetX - pointer.x;
          const dy = targetY - pointer.y;
          const distance = Math.hypot(dx, dy) || 1;
          const strength = Math.max(0, 1 - distance / 150);
          pullX = (dx / distance) * strength * 50;
          pullY = (dy / distance) * strength * 50;
        }

        particle.x += (targetX + pullX - particle.x) * 0.1;
        particle.y += (targetY + pullY - particle.y) * 0.1;
        const pulse = 0.7 + (Math.sin(seconds * 3 + particle.phase) + 1) * 0.15;
        context.beginPath();
        const capsuleWidth = particle.size * pulse * 2.9;
        const capsuleHeight = particle.size * pulse * 2.9;
        const radius = capsuleHeight / 2;

        context.roundRect(
          particle.x - capsuleWidth / 2,
          particle.y - capsuleHeight / 2,
          capsuleWidth,
          capsuleHeight,
          radius,
        );
        context.fillStyle = `rgba(85, 85, 230, ${0.24 + particle.depth * 0.42})`;
        context.fill();
      });

      frameId = window.requestAnimationFrame(render);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(panel);
    panel.addEventListener("pointermove", setPointer);
    panel.addEventListener("pointerleave", clearPointer);
    resize();
    frameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
      panel.removeEventListener("pointermove", setPointer);
      panel.removeEventListener("pointerleave", clearPointer);
    };
  }, []);

  return (
    <aside ref={panelRef} className="antigravity-panel" aria-hidden="true">
      <canvas ref={canvasRef} className="antigravity-panel__canvas" />
    </aside>
  );
}

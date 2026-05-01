import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { AsciiEffect } from "three/examples/jsm/effects/AsciiEffect.js";
import { motion } from "motion/react";
import {
  Bot,
  Database,
  Workflow,
  Network,
  Sparkles,
  Server,
  ArrowUpRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { seekingItems } from "../data/seeking";

const HEAD_MODEL_URL = `${import.meta.env.BASE_URL}models/head.glb`;

const ICON_MAP: Record<string, LucideIcon> = {
  bot: Bot,
  database: Database,
  workflow: Workflow,
  network: Network,
  sparkles: Sparkles,
  server: Server,
};

const FOCUS_AREAS = seekingItems.map((item) => ({
  ...item,
  icon: ICON_MAP[item.icon] || Sparkles,
}));

export const SeekingSection = () => {
  // Shared cursor target — tracks mouse within the section,
  // normalized relative to the face container's bounds.
  const cursorRef = useRef({ x: 0, y: 0 });
  const faceWrapRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const onMove = (e: MouseEvent) => {
      const r = faceWrapRef.current?.getBoundingClientRect();
      if (!r) return;
      cursorRef.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      cursorRef.current.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    };
    const onLeave = () => {
      cursorRef.current.x = 0;
      cursorRef.current.y = 0;
    };
    section.addEventListener("mousemove", onMove);
    section.addEventListener("mouseleave", onLeave);
    return () => {
      section.removeEventListener("mousemove", onMove);
      section.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <section ref={sectionRef} id="seeking" className="relative py-24 px-4 overflow-hidden">

      {/* ASCII face — positioned relative to the section, not the inner container */}
      <div ref={faceWrapRef} className="absolute top-0 right-0 bottom-0 w-[50%] z-0">
        <AsciiHead cursorRef={cursorRef} />
      </div>

      <div className="container mx-auto max-w-6xl relative">
        <div className="flex justify-center mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs font-mono uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Currently Learning · Open to Opportunities
          </div>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          What I'm <span className="text-primary">Building Toward</span>
        </h2>
        <p className="text-center text-foreground/70 mb-12 max-w-2xl mx-auto">
          The next chapter of my craft — where AI stops being a feature and
          starts becoming the workflow itself. These are the areas I'm actively
          studying, prototyping, and want to build my next role around.
        </p>

        <div className="relative">
          {/* List only covers up to 70% width — the remaining 30% lets the
              face peek out (face is 60% wide, so half of it = 30% exposed). */}
          <div className="relative z-10 space-y-4 w-full">
          {FOCUS_AREAS.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{
                duration: 0.5,
                delay: i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative p-5 rounded-2xl border border-border bg-card/40 backdrop-blur-sm hover:border-primary/50 hover:bg-card/70 transition-all text-left"
            >
              <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-gradient-to-b from-fuchsia-500 via-purple-500 to-cyan-500 rounded-full" />

              <div className="flex items-start gap-4 pl-3">
                <div className="p-2.5 rounded-xl bg-primary/15 text-primary group-hover:scale-110 transition-transform shrink-0">
                  <f.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-semibold text-base">{f.title}</h3>
                    <Sparkles
                      size={12}
                      className="text-primary/60 group-hover:text-primary transition-colors"
                    />
                  </div>
                  <p className="text-sm text-foreground/70 leading-relaxed mb-3">
                    {f.desc}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {f.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-full border border-primary/30 text-primary/80 bg-primary/5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="pt-2 text-left"
          >
            <a
              href="#contact"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors group"
            >
              Building something in this space? Let's talk.
              <ArrowUpRight
                size={14}
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              />
            </a>
          </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ====================================================================== */
/* ASCII humanoid head — renders head.glb through three.js AsciiEffect      */
/* ====================================================================== */

const ASCII_RAMP = " .,:;i1tfLCG08@";

const GLITCH_LINES = [
  "training started.",
  "-- epoch 1/ average",
  "epoch 1: 3.745e-04",
  "epoch 2: 1.892e-04",
  "epoch 3: 9.214e-05",
  "epoch 4: 4.733e-05",
  "epoch 5: 2.108e-05",
  "epoch 6: 1.625e-05",
  "grad: 2.31e-08",
  "loss converged.",
  "checkpoint saved.",
];

const AsciiHead = ({ cursorRef }: { cursorRef: React.RefObject<{ x: number; y: number }> }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const targetRef = cursorRef;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    camera.position.set(0, 0, 5); // overwritten once we know the model's size

    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(2, 2, 3);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 0.7);
    rim.position.set(-3, 1, -2);
    scene.add(rim);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);

    // Color is applied via the container's CSS (dark:/light: classes).
    // We just need to ensure inheritance works through the effect DOM.
    renderer.domElement.style.color = "inherit";

    // `invert: false` → empty pixels map to SPACE (invisible). Only lit
    // surfaces produce visible glyphs, so the page background shows through.
    const effect = new AsciiEffect(renderer, ASCII_RAMP, {
      invert: false,
      resolution: 0.2,
      scale: 1,
      color: false,
    });
    // Inherit color from the container div (set via Tailwind classes)
    effect.domElement.style.color = "inherit";
    const asciiTable = effect.domElement.querySelector("table");
    if (asciiTable) {
      asciiTable.style.color = "inherit";
    }
    effect.domElement.style.textShadow = "none";
    effect.domElement.style.backgroundColor = "transparent";
    effect.domElement.style.fontFamily =
      "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    effect.domElement.style.fontWeight = "700";
    effect.domElement.style.letterSpacing = "0px";
    effect.domElement.style.lineHeight = "1";
    effect.domElement.style.position = "absolute";
    effect.domElement.style.inset = "0";
    effect.domElement.style.display = "flex";
    effect.domElement.style.alignItems = "center";
    effect.domElement.style.justifyContent = "center";
    effect.domElement.style.pointerEvents = "none";
    effect.domElement.style.userSelect = "none";
    container.appendChild(effect.domElement);

    const setSize = () => {
      const { clientWidth: w, clientHeight: h } = container;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      effect.setSize(w, h);
    };
    setSize();
    const ro = new ResizeObserver(setSize);
    ro.observe(container);

    const headGroup = new THREE.Group();
    scene.add(headGroup);

    const clock = new THREE.Clock();
    let mixer: THREE.AnimationMixer | null = null;
    let modelRadius = 1;

    let disposed = false;
    new GLTFLoader().load(
      HEAD_MODEL_URL,
      (gltf) => {
        if (disposed) return;
        const head = gltf.scene;

        // Plain matte material so AsciiEffect's brightness sampling depends
        // on shading alone — no baked textures interfering with the ramp.
        head.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.isMesh) {
            m.material = new THREE.MeshStandardMaterial({
              color: 0xffffff,
              roughness: 0.85,
              metalness: 0.0,
            });
          }
        });

        // Center + uniform scale so the largest dimension == 2 units.
        const box = new THREE.Box3().setFromObject(head);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);
        head.position.sub(center);
        const s = 2 / Math.max(size.x, size.y, size.z);
        head.scale.setScalar(s);
        headGroup.add(head);

        // ---- Fit the camera so the model fills the container HEIGHT. ----
        // Use the bounding SPHERE so distance is independent of orientation.
        const fitBox = new THREE.Box3().setFromObject(headGroup);
        const fitSphere = fitBox.getBoundingSphere(new THREE.Sphere());
        modelRadius = fitSphere.radius;

        // Point the camera at the model's actual center.
        const cx = fitSphere.center.x;
        const cy = fitSphere.center.y;

        const fov = (camera.fov * Math.PI) / 180;
        // Use vertical distance only — we want the model to fill the height.
        // Horizontal overflow is fine since we shift it right and it can
        // partially go off-screen.
        const vFov = fov;
        const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
        const distV = fitSphere.radius / Math.sin(vFov / 2);
        const distH = fitSphere.radius / Math.sin(hFov / 2);
        const dist = Math.min(distV, distH) * 0.95;
        // Shift camera left so the model appears shifted to the right
        camera.position.set(cx - 0.6, cy, dist);
        camera.lookAt(cx - 0.6, cy, 0);

        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(head);
          gltf.animations.forEach((clip) => mixer!.clipAction(clip).play());
        }
      },
      undefined,
      (err) => {
        // eslint-disable-next-line no-console
        console.warn("[SeekingSection] head.glb failed:", err);
      },
    );

    let glitchUntil = 0;
    const scheduleGlitch = () => {
      const next = 1500 + Math.random() * 4500;
      window.setTimeout(() => {
        glitchUntil = performance.now() + 80 + Math.random() * 180;
        scheduleGlitch();
      }, next);
    };
    scheduleGlitch();

    let raf = 0;
    let yaw = 0;
    let pitch = 0;
    const animate = () => {
      const dt = clock.getDelta();
      if (mixer) mixer.update(dt);

      // Smoothly chase the cursor target. cursor.x → yaw, cursor.y → pitch.
      // Limit to ~35° each side so the look stays believable.
      const tx = targetRef.current.x * 0.6;
      const ty = -targetRef.current.y * 0.35;
      const k = Math.min(1, dt * 6); // critically-damped feel
      yaw += (tx - yaw) * k;
      pitch += (ty - pitch) * k;

      if (performance.now() < glitchUntil) {
        headGroup.position.x = (Math.random() - 0.5) * modelRadius * 0.25;
        headGroup.rotation.y = yaw + (Math.random() - 0.5) * 0.2;
        headGroup.rotation.x = pitch;
        headGroup.rotation.z = (Math.random() - 0.5) * 0.08;
      } else {
        headGroup.position.x = 0;
        headGroup.rotation.set(pitch, yaw, 0);
      }

      effect.render(scene, camera);
      // Force color on the freshly-rebuilt <td> after every render
      const td = effect.domElement.querySelector("td");
      if (td) {
        const dark = document.documentElement.classList.contains("dark");
        td.style.color = dark ? "rgba(200,210,230,0.25)" : "rgba(30,40,60,0.20)";
      }
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      if (effect.domElement.parentNode === container) {
        container.removeChild(effect.domElement);
      }
    };
  }, []);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const id = window.setInterval(() => {
      const lines = Array.from(overlay.children) as HTMLElement[];
      lines.forEach((el) => {
        if (Math.random() < 0.35) {
          el.textContent =
            GLITCH_LINES[Math.floor(Math.random() * GLITCH_LINES.length)];
          el.style.opacity = (0.25 + Math.random() * 0.55).toFixed(2);
          el.style.transform = `translate(${(Math.random() - 0.5) * 12}px, ${
            (Math.random() - 0.5) * 8
          }px) rotate(180deg)`;
        }
      });
    }, 220);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className="relative w-full h-full select-none"
      style={{ minHeight: "100%" }}
    >
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-hidden"
        style={{ fontSize: "7px" }}
      />

      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 3px)",
        }}
      />

      <div
        ref={overlayRef}
        aria-hidden
        className="absolute inset-0 pointer-events-none font-mono text-[10px] leading-tight text-white/40"
        style={{ transform: "scaleX(-1)" }}
      >
        {GLITCH_LINES.map((line, i) => (
          <div
            key={i}
            className="absolute whitespace-nowrap transition-all duration-150"
            style={{
              left: `${8 + ((i * 7) % 35)}%`,
              top: `${15 + i * 6}%`,
              opacity: 0.4,
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeekingSection;

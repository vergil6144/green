"use client";

import { useEffect, useRef } from "react";

export default function AnimatedBG() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const canvas = ref.current;
    if (!canvas) return;

  let mounted = true;
  let three: any = null;
  let renderer: any = null;
  let scene: any = null;
  let camera: any = null;
  let material: any = null;
  let mesh: any = null;
  let raf = 0;
  const canvasEl = canvas as HTMLCanvasElement;
  let resize: (() => void) | null = null;
  let animateFn: ((t: number) => void) | null = null;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');

  // @ts-ignore dynamic import - optional dependency
  import('three').then((THREE) => {
      if (!mounted) return;
      three = THREE;

      const { WebGLRenderer, Scene, OrthographicCamera, PlaneGeometry, ShaderMaterial, Mesh, Vector2 } = THREE as any;

      renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(window.innerWidth, window.innerHeight, false);

      scene = new Scene();
      camera = new OrthographicCamera(-1, 1, 1, -1, 0, 10);
      camera.position.z = 1;

      const fragmentShader = `
        precision highp float;
        uniform vec2 u_resolution;
        uniform float u_time;

        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453123); }
        float noise(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); float a=hash(i); float b=hash(i+vec2(1.0,0.0)); float c=hash(i+vec2(0.0,1.0)); float d=hash(i+vec2(1.0,1.0)); vec2 u=f*f*(3.0-2.0*f); return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y; }
        float fbm(vec2 p){ float v=0.0; float a=0.5; for(int i=0;i<6;i++){ v+=a*noise(p); p*=2.0; a*=0.5; } return v; }

        vec2 rot(vec2 p, float a){ float c = cos(a); float s = sin(a); return mat2(c, -s, s, c) * p; }

        void main(){
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

          float t = u_time * 0.32; 

          p = rot(p, -0.35);

          float b1 = sin(p.y * 1.05 + t * 0.5) * 0.9;
          float b2 = sin(p.y * 0.55 + t * 0.32 + 1.2) * 0.55;

          float warp = sin(p.x * 2.2 + t * 0.18) * 0.45 + fbm(vec2(p.x * 0.6, p.y * 0.2) + t * 0.03) * 0.28;

          float s1 = sin(p.y * 12.0 + t * 0.9 + warp * 3.2) * 0.18;
          float s2 = sin(p.y * 16.5 + t * 1.05 + 0.9 + warp * 4.0) * 0.14;
          float s3 = sin(p.y * 9.0 + t * 0.75 + 2.3 + warp * 2.6) * 0.10;
          float s4 = sin(p.y * 22.0 + t * 1.2 + 0.4 + warp * 5.0) * 0.05; 

          float waves = b1 * 0.6 + b2 * 0.28 + (s1 + s2 + s3 + s4) * 0.6;

          float n = fbm(p * 0.85 + vec2(t * 0.02, -t * 0.01)) * 0.10;
          waves += n * 0.10;

          float thinMask = 0.0;
          thinMask += smoothstep(0.20, 0.22, abs(s1 + n * 0.04));
          thinMask += smoothstep(0.16, 0.18, abs(s2 + n * 0.035));
          thinMask += smoothstep(0.14, 0.16, abs(s3 + n * 0.03));
          thinMask += smoothstep(0.10, 0.12, abs(s4 + n * 0.02));
          thinMask *= 0.25;
          thinMask = clamp(thinMask, 0.0, 1.0);

          float crest = smoothstep(0.48, 0.56, waves) * (1.0 - smoothstep(0.56, 0.66, waves));
          crest = pow(crest, 1.2);

          vec3 base = vec3(0.008, 0.02, 0.01) + n * 0.006;
          vec3 lineHighlight = vec3(0.09, 0.18, 0.08) * 0.55;
          vec3 crestHighlight = vec3(0.12, 0.22, 0.10) * 0.50;

          vec3 col = base;
          col += lineHighlight * thinMask * 0.45;
          col += crestHighlight * crest * 0.45;

          col *= mix(1.0, 0.80, smoothstep(0.0, -0.28, waves));

          float dist = length((gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.xy);
          float vig = smoothstep(0.94, 0.26, dist);
          col *= mix(1.0, 0.78, vig);

          gl_FragColor = vec4(col, 1.0);
        }
      `;

      material = new ShaderMaterial({
        uniforms: {
          u_time: { value: 0 },
          u_resolution: { value: new Vector2(canvas.width, canvas.height) }
        },
        vertexShader: `void main(){ gl_Position = vec4(position, 1.0); }`,
        fragmentShader,
        depthWrite: false,
      });

      const geo = new PlaneGeometry(2, 2);
      mesh = new Mesh(geo, material);
      scene.add(mesh);

      resize = function() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        renderer.setPixelRatio(dpr);
        renderer.setSize(window.innerWidth, window.innerHeight, false);
        if (material && material.uniforms && material.uniforms.u_resolution) {
          material.uniforms.u_resolution.value.set(canvasEl.width, canvasEl.height);
        }
      }

      animateFn = function(time: number) {
        if (!mounted || !material) return;
        if (material.uniforms) material.uniforms.u_time.value = time / 1000;
        renderer.render(scene, camera);
        raf = requestAnimationFrame(animateFn as any);
      };

      window.addEventListener('resize', resize as any);
      resize();
      if (!media || !media.matches) raf = requestAnimationFrame(animateFn as any);
    }).catch((err) => {
      console.error('AnimatedBG load error', err);
    });

    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
  try { if (resize) window.removeEventListener('resize', resize as any); } catch (e) {}
      try {
        if (mesh) { mesh.geometry?.dispose?.(); mesh.material?.dispose?.(); }
        if (renderer) { renderer.dispose?.(); renderer.forceContextLoss?.(); }
        if (scene) { scene.clear?.(); }
      } catch (e) {}
    };
  }, []);

  return <canvas ref={ref} className="animated-bg-canvas" />;
}

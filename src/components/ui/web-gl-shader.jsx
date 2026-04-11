import { useEffect, useRef } from "react"
import * as THREE from "three"

export function WebGLShader({
  xScale = 1.0,
  yScale = 0.4,
  distortion = 0.04,
  speed = 0.008,
  className = "",
}) {
  const canvasRef = useRef(null)
  const sceneRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    mesh: null,
    uniforms: null,
    animationId: null,
  })

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const refs = sceneRef.current

    // Fragment shader tuned to site palette:
    // Moss green (#2E4036) base, Clay (#C4572B) accent, deep forest feel
    const vertexShader = `
      attribute vec3 position;
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `

    const fragmentShader = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform float xScale;
      uniform float yScale;
      uniform float distortion;

      void main() {
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);

        float d = length(p) * distortion;

        float rx = p.x * (1.0 + d);
        float gx = p.x;
        float bx = p.x * (1.0 - d);

        // Moss green: r=0.18, g=0.25, b=0.21
        // Clay accent: r=0.77, g=0.34, b=0.17
        // Weighted so the wave feels organic + prophetic, not neon
        float r = 0.04 / abs(p.y + sin((rx + time) * xScale) * yScale) * 0.77;
        float g = 0.04 / abs(p.y + sin((gx + time) * xScale) * yScale) * 0.55;
        float b = 0.04 / abs(p.y + sin((bx + time) * xScale) * yScale) * 0.32;

        gl_FragColor = vec4(r, g, b, 1.0);
      }
    `

    refs.scene = new THREE.Scene()
    refs.renderer = new THREE.WebGLRenderer({ canvas, alpha: true })
    refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    refs.renderer.setClearColor(new THREE.Color(0x060f09), 1)
    refs.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1)

    refs.uniforms = {
      resolution: { value: [canvas.clientWidth, canvas.clientHeight] },
      time: { value: 0.0 },
      xScale: { value: xScale },
      yScale: { value: yScale },
      distortion: { value: distortion },
    }

    const positions = new THREE.BufferAttribute(
      new Float32Array([
        -1.0, -1.0, 0.0,
         1.0, -1.0, 0.0,
        -1.0,  1.0, 0.0,
         1.0, -1.0, 0.0,
        -1.0,  1.0, 0.0,
         1.0,  1.0, 0.0,
      ]),
      3
    )
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", positions)

    const material = new THREE.RawShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: refs.uniforms,
      side: THREE.DoubleSide,
    })

    refs.mesh = new THREE.Mesh(geometry, material)
    refs.scene.add(refs.mesh)

    const handleResize = () => {
      if (!refs.renderer || !refs.uniforms) return
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      refs.renderer.setSize(w, h, false)
      refs.uniforms.resolution.value = [w, h]
    }

    const animate = () => {
      if (refs.uniforms) refs.uniforms.time.value += speed
      if (refs.renderer && refs.scene && refs.camera) {
        refs.renderer.render(refs.scene, refs.camera)
      }
      refs.animationId = requestAnimationFrame(animate)
    }

    handleResize()
    animate()
    window.addEventListener("resize", handleResize)

    return () => {
      if (refs.animationId) cancelAnimationFrame(refs.animationId)
      window.removeEventListener("resize", handleResize)
      if (refs.mesh) {
        refs.scene?.remove(refs.mesh)
        refs.mesh.geometry.dispose()
        refs.mesh.material.dispose()
      }
      refs.renderer?.dispose()
    }
  }, [xScale, yScale, distortion, speed])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  )
}

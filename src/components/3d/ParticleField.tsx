"use client"

import { useRef, useMemo, useCallback } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

function Particles({ count = 400 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const { viewport } = useThree()

  const handlePointerMove = useCallback((e: { clientX: number; clientY: number }) => {
    mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
    mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
  }, [])

  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const siz = new Float32Array(count)
    const purple = new THREE.Color("#7c3aed")
    const cyan = new THREE.Color("#06b6d4")
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20
      const mix = Math.random()
      const color = purple.clone().lerp(cyan, mix)
      col[i * 3] = color.r
      col[i * 3 + 1] = color.g
      col[i * 3 + 2] = color.b
      siz[i] = Math.random() * 3 + 1
    }
    return [pos, col, siz]
  }, [count])

  useFrame((state) => {
    if (!mesh.current) return
    const positions = mesh.current.geometry.attributes.position.array as Float32Array
    const time = state.clock.elapsedTime * 0.05
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      positions[i3] += Math.sin(time + i) * 0.001
      positions[i3 + 1] += Math.cos(time + i) * 0.001
      positions[i3] += mouse.current.x * 0.002
      positions[i3 + 1] += mouse.current.y * 0.002
    }
    mesh.current.geometry.attributes.position.needsUpdate = true
    mesh.current.rotation.y = time * 0.1
  })

  return (
    <points
      ref={mesh}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => document.body.style.cursor = "pointer"}
      onPointerLeave={() => document.body.style.cursor = "default"}
    >
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

export default function ParticleField() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Particles count={400} />
      </Canvas>
    </div>
  )
}

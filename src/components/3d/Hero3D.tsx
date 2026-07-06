"use client"

import { Suspense, useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float, MeshDistortMaterial, Sphere, Torus, Octahedron, Environment } from "@react-three/drei"
import * as THREE from "three"

function FloatingShapes() {
  const group = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.05
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.1
    }
  })

  return (
    <group ref={group}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={2}>
        <Torus args={[1, 0.3, 16, 32]} position={[-3, 1, -2]}>
          <MeshDistortMaterial
            color="#7c3aed"
            emissive="#7c3aed"
            emissiveIntensity={0.3}
            transparent
            opacity={0.8}
            wireframe
          />
        </Torus>
      </Float>

      <Float speed={2} rotationIntensity={0.3} floatIntensity={1.5}>
        <Octahedron args={[1.2]} position={[3, -0.5, -1]}>
          <MeshDistortMaterial
            color="#06b6d4"
            emissive="#06b6d4"
            emissiveIntensity={0.4}
            transparent
            opacity={0.7}
            wireframe
          />
        </Octahedron>
      </Float>

      <Float speed={1.8} rotationIntensity={0.15} floatIntensity={2.5}>
        <Sphere args={[0.8, 32, 32]} position={[0, 2.5, -3]}>
          <MeshDistortMaterial
            color="#f59e0b"
            emissive="#f59e0b"
            emissiveIntensity={0.3}
            transparent
            opacity={0.6}
            distort={0.3}
            speed={2}
          />
        </Sphere>
      </Float>

      <Float speed={1.2} rotationIntensity={0.4} floatIntensity={1.8}>
        <Torus args={[0.8, 0.15, 16, 32]} position={[-2.5, -1.5, -1]}>
          <MeshDistortMaterial
            color="#ec4899"
            emissive="#ec4899"
            emissiveIntensity={0.5}
            transparent
            opacity={0.7}
            wireframe
          />
        </Torus>
      </Float>

      <Float speed={2.2} rotationIntensity={0.25} floatIntensity={2}>
        <Octahedron args={[0.6]} position={[2, 2, 0]}>
          <MeshDistortMaterial
            color="#7c3aed"
            emissive="#7c3aed"
            emissiveIntensity={0.6}
            transparent
            opacity={0.5}
          />
        </Octahedron>
      </Float>

      {useMemo(
        () =>
          Array.from({ length: 30 }).map((_, i) => (
            <mesh key={i} position={[
              (Math.random() - 0.5) * 12,
              (Math.random() - 0.5) * 8,
              (Math.random() - 0.5) * 8 - 4,
            ]}>
              <sphereGeometry args={[0.02 + Math.random() * 0.04, 4, 4]} />
              <meshBasicMaterial
                color={i % 2 === 0 ? "#7c3aed" : "#06b6d4"}
                transparent
                opacity={0.6 + Math.random() * 0.4}
              />
            </mesh>
          )),
        []
      )}
    </group>
  )
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#7c3aed" />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color="#06b6d4" />
      <spotLight position={[0, 5, 5]} intensity={0.5} color="#f59e0b" />
    </>
  )
}

function Scene() {
  return (
    <>
      <Lights />
      <FloatingShapes />
      <Environment preset="night" />
    </>
  )
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 65 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}

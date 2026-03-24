/**
 * BattleArena3D — Naruto-universe themed arena
 *
 * Scene:
 *  - Circular stone arena (Chunin Exam style)
 *  - Stone pillars at corners with flaming torches
 *  - Konoha summoning seal glowing on the floor
 *  - Metallic shurikens orbiting the arena
 *  - Flying leaves drifting across (Hidden Leaf Village)
 *  - Background forest silhouettes
 *  - Warm torch lighting + fog for atmosphere
 */
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function BattleArena3D() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // ── Renderer ──────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // ── Scene & Camera ────────────────────────────────────────
    const scene = new THREE.Scene()
    // Dusk forest fog — brownish-dark
    scene.fog = new THREE.FogExp2(0x110d08, 0.042)

    const camera = new THREE.PerspectiveCamera(52, mount.clientWidth / mount.clientHeight, 0.1, 80)
    camera.position.set(0, 6, 13)
    camera.lookAt(0, 0, 0)

    // ── Lights ────────────────────────────────────────────────
    // Moonlight — cool blue-grey from above
    scene.add(new THREE.AmbientLight(0x1a1510, 1.4))
    const moonLight = new THREE.DirectionalLight(0xc8d0e8, 0.35)
    moonLight.position.set(-4, 10, 3)
    scene.add(moonLight)

    // 4 torch point-lights (warm orange-red)
    const TORCH_POS = [[-6.5, 2, -5.5], [6.5, 2, -5.5], [-6.5, 2, 5.5], [6.5, 2, 5.5]]
    const torchLights = TORCH_POS.map((pos, i) => {
      const light = new THREE.PointLight(0xff6600, 4, 13)
      light.position.set(...pos)
      scene.add(light)
      return light
    })

    // ── Floor — sandy stone circle (Chunin arena) ─────────────
    const floorGeo = new THREE.CircleGeometry(10.5, 72)
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x4a3c28, roughness: 0.92, metalness: 0.04,
    })
    const floor = new THREE.Mesh(floorGeo, floorMat)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -1.5
    scene.add(floor)

    // Dirt outer ring
    const outerRingGeo = new THREE.RingGeometry(10.5, 18, 72)
    const outerRingMat = new THREE.MeshStandardMaterial({ color: 0x1e1408, roughness: 1 })
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat)
    outerRing.rotation.x = -Math.PI / 2
    outerRing.position.y = -1.51
    scene.add(outerRing)

    // Stone arena wall
    const wallGeo = new THREE.CylinderGeometry(10.7, 11.0, 3.5, 48, 1, true)
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x2e2416, roughness: 0.95, metalness: 0.05, side: THREE.BackSide,
    })
    const wall = new THREE.Mesh(wallGeo, wallMat)
    wall.position.y = 0.25
    scene.add(wall)

    // Low stone boundary ring (top edge of wall)
    const rimGeo = new THREE.TorusGeometry(10.7, 0.25, 8, 64)
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x3a2c1a, roughness: 0.9, metalness: 0.05 })
    const rim = new THREE.Mesh(rimGeo, rimMat)
    rim.rotation.x = Math.PI / 2
    rim.position.y = 2.0
    scene.add(rim)

    // ── Konoha Summoning Seal on the floor ────────────────────
    const sealGroup = new THREE.Group()
    sealGroup.rotation.x = -Math.PI / 2
    sealGroup.position.y = -1.48

    const SEAL_GREEN   = 0x44ff88
    const SEAL_GREEN2  = 0x22cc55

    const lineMat = (color, opacity = 0.55) =>
      new THREE.LineBasicMaterial({ color, transparent: true, opacity })

    function circleLine(radius, mat, segs = 96) {
      const pts = []
      for (let i = 0; i <= segs; i++) {
        const a = (i / segs) * Math.PI * 2
        pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0))
      }
      return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat)
    }

    // Outer rings
    sealGroup.add(circleLine(4.2, lineMat(SEAL_GREEN,  0.65)))
    sealGroup.add(circleLine(3.8, lineMat(SEAL_GREEN2, 0.45)))
    sealGroup.add(circleLine(2.1, lineMat(SEAL_GREEN,  0.55)))
    sealGroup.add(circleLine(0.6, lineMat(SEAL_GREEN2, 0.5)))

    // 8-pointed star (summoning style)
    const STAR_POINTS = 8
    const starPts = []
    for (let i = 0; i <= STAR_POINTS * 2; i++) {
      const a = (i / (STAR_POINTS * 2)) * Math.PI * 2 - Math.PI / STAR_POINTS
      const r = i % 2 === 0 ? 3.8 : 1.5
      starPts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0))
    }
    sealGroup.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(starPts),
      lineMat(SEAL_GREEN2, 0.45)
    ))

    // Leaf symbol in the center (two arcs forming a tear/leaf shape)
    const leafPts1 = [], leafPts2 = []
    for (let i = 0; i <= 40; i++) {
      const a = (i / 40) * Math.PI
      leafPts1.push(new THREE.Vector3( Math.sin(a) * 0.9, Math.cos(a) * 0.9 + 0.3, 0))
      leafPts2.push(new THREE.Vector3(-Math.sin(a) * 0.9, Math.cos(a) * 0.9 + 0.3, 0))
    }
    sealGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(leafPts1), lineMat(SEAL_GREEN, 0.8)))
    sealGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(leafPts2), lineMat(SEAL_GREEN, 0.8)))

    // Radial spokes
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      const pts = [
        new THREE.Vector3(Math.cos(a) * 2.1, Math.sin(a) * 2.1, 0),
        new THREE.Vector3(Math.cos(a) * 3.8, Math.sin(a) * 3.8, 0),
      ]
      sealGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat(SEAL_GREEN2, 0.35)))
    }

    // Small triangle accents between spokes
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + (Math.PI / 8)
      const r = 2.9
      const tip  = new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0)
      const bl   = new THREE.Vector3(Math.cos(a - 0.18) * 2.3, Math.sin(a - 0.18) * 2.3, 0)
      const br   = new THREE.Vector3(Math.cos(a + 0.18) * 2.3, Math.sin(a + 0.18) * 2.3, 0)
      sealGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([tip, bl, br, tip]),
        lineMat(SEAL_GREEN2, 0.3)
      ))
    }

    scene.add(sealGroup)

    // ── Stone Pillars + Torches ───────────────────────────────
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x2c2014, roughness: 0.95 })
    const goldMat  = new THREE.MeshStandardMaterial({ color: 0x9a7a30, metalness: 0.7, roughness: 0.3 })
    const flameMats = Array.from({ length: 4 }, () =>
      new THREE.MeshStandardMaterial({
        color: 0xff8800, emissive: 0xff5500, emissiveIntensity: 2.5,
        transparent: true, opacity: 0.85,
      })
    )

    const torchData = []
    TORCH_POS.forEach((pos, i) => {
      // Square pillar (more ninja/castle style than round)
      const pillarGeo = new THREE.BoxGeometry(0.55, 4.5, 0.55)
      const pillar    = new THREE.Mesh(pillarGeo, stoneMat)
      pillar.position.set(pos[0], pos[1] - 1.3, pos[2])
      scene.add(pillar)

      // Gold cap on top
      const capGeo = new THREE.BoxGeometry(0.7, 0.2, 0.7)
      const cap    = new THREE.Mesh(capGeo, goldMat)
      cap.position.set(pos[0], pos[1] + 0.95, pos[2])
      scene.add(cap)

      // Torch bowl
      const bowlGeo = new THREE.CylinderGeometry(0.22, 0.14, 0.28, 8)
      const bowl    = new THREE.Mesh(bowlGeo, goldMat)
      bowl.position.set(pos[0], pos[1] + 1.0, pos[2])
      scene.add(bowl)

      // Flame cluster (3 overlapping teardrop-ish spheres)
      const flameGroup = new THREE.Group()
      flameGroup.position.set(pos[0], pos[1] + 1.25, pos[2])
      const fMat = flameMats[i]
      const sizes = [0.14, 0.10, 0.09]
      const offsets = [[0, 0], [0.06, -0.06], [-0.05, -0.04]]
      sizes.forEach((s, j) => {
        const fGeo  = new THREE.SphereGeometry(s, 8, 8)
        const flame = new THREE.Mesh(fGeo, fMat)
        flame.position.set(offsets[j][0], j * 0.1, offsets[j][1])
        flameGroup.add(flame)
      })
      scene.add(flameGroup)

      torchData.push({
        flameGroup,
        light: torchLights[i],
        baseY: pos[1] + 1.25,
        phase: i * 1.57,
      })
    })

    // ── Background Forest Trees ───────────────────────────────
    const trunkMat  = new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 1 })
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x1a3a0a, roughness: 0.9, transparent: true, opacity: 0.92 })
    const TREE_RING_RADIUS = 14
    for (let i = 0; i < 18; i++) {
      const a   = (i / 18) * Math.PI * 2
      const r   = TREE_RING_RADIUS + (Math.random() - 0.5) * 3
      const x   = Math.cos(a) * r
      const z   = Math.sin(a) * r
      const h   = 3 + Math.random() * 3.5

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, h, 6), trunkMat)
      trunk.position.set(x, -1.5 + h / 2, z)
      scene.add(trunk)

      // Two foliage layers (cone + smaller cone on top)
      const fh1 = 2.2 + Math.random() * 1.5
      const fh2 = 1.4 + Math.random() * 1.0
      const cone1 = new THREE.Mesh(new THREE.ConeGeometry(1.4 + Math.random() * 0.6, fh1, 7), foliageMat)
      cone1.position.set(x, -1.5 + h + fh1 / 2 - 0.3, z)
      scene.add(cone1)

      const cone2 = new THREE.Mesh(new THREE.ConeGeometry(0.9 + Math.random() * 0.3, fh2, 7), foliageMat)
      cone2.position.set(x, -1.5 + h + fh1 + fh2 / 2 - 0.5, z)
      scene.add(cone2)
    }

    // ── Shurikens ─────────────────────────────────────────────
    function shurikenShape() {
      const shape = new THREE.Shape()
      const BLADES = 4
      for (let i = 0; i < BLADES * 2; i++) {
        const angle = (i / (BLADES * 2)) * Math.PI * 2 - Math.PI / (BLADES * 2)
        const r     = i % 2 === 0 ? 0.38 : 0.13
        const x     = Math.cos(angle) * r
        const y     = Math.sin(angle) * r
        i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)
      }
      shape.closePath()
      // Center hole
      const hole = new THREE.Path()
      for (let i = 0; i <= 16; i++) {
        const a = (i / 16) * Math.PI * 2
        const x = Math.cos(a) * 0.07
        const y = Math.sin(a) * 0.07
        i === 0 ? hole.moveTo(x, y) : hole.lineTo(x, y)
      }
      shape.holes.push(hole)
      return new THREE.ShapeGeometry(shape)
    }
    const shurikenMat = new THREE.MeshStandardMaterial({
      color: 0x7a8090, metalness: 0.95, roughness: 0.15,
      emissive: 0x223344, emissiveIntensity: 0.3,
    })
    const SHURIKEN_DATA = [
      { r: 5.8, angle: 0,              speed: 0.28, y: 1.6, bob: 0.9 },
      { r: 7.0, angle: Math.PI * 0.66, speed: 0.20, y: 0.9, bob: 0.7 },
      { r: 5.2, angle: Math.PI * 1.33, speed: 0.35, y: 2.2, bob: 1.1 },
    ]
    const shurikens = SHURIKEN_DATA.map(d => {
      const mesh = new THREE.Mesh(shurikenShape(), shurikenMat.clone())
      mesh.position.set(Math.cos(d.angle) * d.r, d.y, Math.sin(d.angle) * d.r)
      mesh.rotation.x = -0.25  // tilt toward camera
      mesh.userData = { ...d }
      scene.add(mesh)
      return mesh
    })

    // ── Falling Leaves ────────────────────────────────────────
    const LEAF_COLORS = [0x3d8c2a, 0x4aa835, 0x8fc43a, 0xbbd44a, 0xd4aa30, 0x8c6a20]
    const leaves = Array.from({ length: 55 }, (_, i) => {
      const geo  = new THREE.PlaneGeometry(0.16 + Math.random() * 0.12, 0.09 + Math.random() * 0.06)
      const mat  = new THREE.MeshStandardMaterial({
        color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
        side: THREE.DoubleSide, transparent: true, opacity: 0.65 + Math.random() * 0.3,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(
        (Math.random() - 0.5) * 24,
        Math.random() * 8 - 1,
        (Math.random() - 0.5) * 24
      )
      mesh.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2)
      mesh.userData = {
        vx:  (Math.random() - 0.5) * 0.025,
        vy: -(0.006 + Math.random() * 0.012),
        vz:  (Math.random() - 0.5) * 0.018,
        rx:  (Math.random() - 0.5) * 0.035,
        ry:  (Math.random() - 0.5) * 0.025,
        rz:  (Math.random() - 0.5) * 0.04,
        wobble: Math.random() * Math.PI * 2,
        wobbleS: 0.02 + Math.random() * 0.03,
      }
      scene.add(mesh)
      return mesh
    })

    // ── Resize observer ───────────────────────────────────────
    const ro = new ResizeObserver(() => {
      const w = mount.clientWidth, h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    })
    ro.observe(mount)

    // ── Animation loop ────────────────────────────────────────
    let t = 0
    let rafId

    function animate() {
      rafId = requestAnimationFrame(animate)
      t += 0.012

      // Torch flicker — flame + light
      torchData.forEach(({ flameGroup, light, baseY, phase }) => {
        const flicker = Math.sin(t * 9 + phase) * 0.07 + Math.sin(t * 15 + phase * 1.3) * 0.04
        flameGroup.position.y = baseY + flicker
        flameGroup.children.forEach((f, j) => {
          f.material.emissiveIntensity = 2.2 + Math.sin(t * 8 + phase + j * 0.9) * 0.9
          f.scale.y = 0.88 + Math.sin(t * 11 + phase + j) * 0.2
        })
        light.intensity = 3.0 + Math.sin(t * 7 + phase) * 1.2
        light.color.setHSL(0.06 + Math.sin(t * 2.5 + phase) * 0.015, 1, 0.52)
      })

      // Shurikens orbit + spin
      shurikens.forEach((mesh, i) => {
        const d = mesh.userData
        const a = d.angle + t * d.speed
        mesh.position.x = Math.cos(a) * d.r
        mesh.position.z = Math.sin(a) * d.r
        mesh.position.y = d.y + Math.sin(t * d.bob + i) * 0.35
        mesh.rotation.z += d.speed * 0.25
      })

      // Seal pulse
      const sealPulse = 0.45 + Math.sin(t * 1.2) * 0.2
      sealGroup.children.forEach((line, i) => {
        line.material.opacity = sealPulse + Math.sin(t * 1.8 + i * 0.7) * 0.15
      })

      // Leaves drift + wobble
      leaves.forEach(leaf => {
        const d = leaf.userData
        d.wobble += d.wobbleS
        leaf.position.x += d.vx + Math.sin(d.wobble) * 0.008
        leaf.position.y += d.vy
        leaf.position.z += d.vz + Math.cos(d.wobble * 0.7) * 0.006
        leaf.rotation.x += d.rx
        leaf.rotation.y += d.ry
        leaf.rotation.z += d.rz
        if (leaf.position.y < -2.2) {
          leaf.position.set(
            (Math.random() - 0.5) * 24,
            8 + Math.random() * 2,
            (Math.random() - 0.5) * 24
          )
        }
      })

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  )
}

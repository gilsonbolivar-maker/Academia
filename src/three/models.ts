import * as THREE from 'three';
import {
  createCrateTexture,
  createContactShadowTexture,
  createFloorTexture,
  createTargetTexture,
} from './proceduralTextures';

// Shared materials and geometries for optimal GPU reuse
let cachedShadowTexture: THREE.CanvasTexture | null = null;
let cachedFloorTexture: THREE.CanvasTexture | null = null;
let cachedCrateTexture: THREE.CanvasTexture | null = null;

function getShadowTexture() {
  if (!cachedShadowTexture) {
    cachedShadowTexture = createContactShadowTexture();
  }
  return cachedShadowTexture;
}

export function getFloorTexture() {
  if (!cachedFloorTexture) {
    cachedFloorTexture = createFloorTexture();
  }
  return cachedFloorTexture;
}

export function getCrateTexture() {
  if (!cachedCrateTexture) {
    cachedCrateTexture = createCrateTexture();
  }
  return cachedCrateTexture;
}

/**
 * Creates the Hero Operator Robot:
 * Composite 11-part procedural model (THREE.Group) with PBR materials,
 * grounded at bottom-center with radial contact shadow.
 */
export function createPlayerRobot(isDarkMode: boolean = true): THREE.Group {
  const root = new THREE.Group();
  root.name = 'playerBot';

  // Materials
  const chassisMat = new THREE.MeshStandardMaterial({
    color: isDarkMode ? 0x222a36 : 0x334155,
    metalness: 0.85,
    roughness: 0.25,
  });

  const armorMat = new THREE.MeshStandardMaterial({
    color: isDarkMode ? 0xf59e0b : 0xd97706, // Contemporary warm amber
    metalness: 0.4,
    roughness: 0.3,
  });

  const treadMat = new THREE.MeshStandardMaterial({
    color: 0x111622,
    metalness: 0.2,
    roughness: 0.8,
  });

  const visorMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8, // Sky blue visor
    emissive: 0x0284c7,
    emissiveIntensity: 0.6,
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.6,
    thickness: 0.5,
  });

  const magneticEmitterMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4, // Electric cyan
    emissive: 0x0891b2,
    emissiveIntensity: 0.8,
    metalness: 0.9,
    roughness: 0.2,
  });

  // 1. Contact shadow (grounded at y=0.01 to prevent z-fighting)
  const shadowGeo = new THREE.PlaneGeometry(1.3, 1.3);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: getShadowTexture(),
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.01;
  root.add(shadowMesh);

  // 2. Chassis base
  const chassisGeo = new THREE.BoxGeometry(0.68, 0.18, 0.62);
  const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat);
  chassisMesh.position.y = 0.14;
  chassisMesh.castShadow = true;
  chassisMesh.receiveShadow = true;
  root.add(chassisMesh);

  // 3 & 4. Dual side treads (tracks)
  const treadGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.68, 16);
  treadGeo.rotateX(Math.PI / 2);

  const leftTread = new THREE.Mesh(treadGeo, treadMat);
  leftTread.position.set(-0.36, 0.12, 0);
  leftTread.castShadow = true;
  root.add(leftTread);

  const rightTread = new THREE.Mesh(treadGeo, treadMat);
  rightTread.position.set(0.36, 0.12, 0);
  rightTread.castShadow = true;
  root.add(rightTread);

  // 5. Central body torso
  const torsoGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.38, 16);
  const torsoMesh = new THREE.Mesh(torsoGeo, armorMat);
  torsoMesh.position.y = 0.38;
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;
  root.add(torsoMesh);

  // 6. Energy status ring
  const ringGeo = new THREE.TorusGeometry(0.25, 0.025, 8, 24);
  ringGeo.rotateX(Math.PI / 2);
  const ringMesh = new THREE.Mesh(ringGeo, magneticEmitterMat);
  ringMesh.position.y = 0.36;
  root.add(ringMesh);

  // 7. Head & Optic Visor unit
  const headGroup = new THREE.Group();
  headGroup.name = 'botHead';
  headGroup.position.set(0, 0.62, 0.02);

  const headBaseGeo = new THREE.BoxGeometry(0.36, 0.22, 0.34);
  const headBase = new THREE.Mesh(headBaseGeo, chassisMat);
  headBase.castShadow = true;
  headGroup.add(headBase);

  // Visor face
  const visorGeo = new THREE.BoxGeometry(0.32, 0.12, 0.08);
  const visor = new THREE.Mesh(visorGeo, visorMat);
  visor.position.set(0, 0.02, 0.15);
  headGroup.add(visor);

  // 8. Communication Antenna
  const antennaPoleGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.2, 8);
  const antennaPole = new THREE.Mesh(antennaPoleGeo, chassisMat);
  antennaPole.position.set(0.12, 0.2, -0.06);
  headGroup.add(antennaPole);

  const antennaTipGeo = new THREE.SphereGeometry(0.035, 8, 8);
  const antennaTip = new THREE.Mesh(antennaTipGeo, magneticEmitterMat);
  antennaTip.position.set(0.12, 0.3, -0.06);
  headGroup.add(antennaTip);

  root.add(headGroup);

  // 9 & 10. Left & Right Magnetic Grapple Arms
  const armPivotGroup = new THREE.Group();
  armPivotGroup.name = 'grappleArms';

  // Left Arm
  const leftArm = new THREE.Group();
  leftArm.name = 'leftArm';
  leftArm.position.set(-0.28, 0.38, 0.14);

  const armPistonGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.28, 8);
  armPistonGeo.rotateX(Math.PI / 2);
  const leftPiston = new THREE.Mesh(armPistonGeo, chassisMat);
  leftPiston.position.z = 0.12;
  leftPiston.castShadow = true;
  leftArm.add(leftPiston);

  const padGeo = new THREE.BoxGeometry(0.12, 0.14, 0.06);
  const leftPad = new THREE.Mesh(padGeo, magneticEmitterMat);
  leftPad.position.z = 0.26;
  leftPad.castShadow = true;
  leftArm.add(leftPad);

  armPivotGroup.add(leftArm);

  // Right Arm
  const rightArm = new THREE.Group();
  rightArm.name = 'rightArm';
  rightArm.position.set(0.28, 0.38, 0.14);

  const rightPiston = new THREE.Mesh(armPistonGeo, chassisMat);
  rightPiston.position.z = 0.12;
  rightPiston.castShadow = true;
  rightArm.add(rightPiston);

  const rightPad = new THREE.Mesh(padGeo, magneticEmitterMat);
  rightPad.position.z = 0.26;
  rightPad.castShadow = true;
  rightArm.add(rightPad);

  armPivotGroup.add(rightArm);
  root.add(armPivotGroup);

  // 11. Magnetic tractor beam visualizer (initially invisible, turns visible when pulling)
  const beamGeo = new THREE.CylinderGeometry(0.18, 0.38, 0.9, 16, 1, true);
  beamGeo.rotateX(-Math.PI / 2);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0x06b6d4,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const tractorBeam = new THREE.Mesh(beamGeo, beamMat);
  tractorBeam.name = 'tractorBeamMesh';
  tractorBeam.position.set(0, 0.38, 0.7);
  root.add(tractorBeam);

  return root;
}

/**
 * Creates an interactive Cargo Crate:
 * Composite 5-part procedural model with metallic hazard texture,
 * steel corner bumper brackets, central glowing magnetic latch node,
 * and contact shadow.
 */
export function createCrateGroup(isDarkMode: boolean = true): THREE.Group {
  const root = new THREE.Group();
  root.name = 'crateRoot';

  // 1. Soft contact shadow disc
  const shadowGeo = new THREE.PlaneGeometry(1.25, 1.25);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: getShadowTexture(),
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.01;
  root.add(shadowMesh);

  // 2. Main reinforced cargo hull
  const crateTexture = getCrateTexture();
  const hullMat = new THREE.MeshStandardMaterial({
    map: crateTexture,
    metalness: 0.6,
    roughness: 0.35,
  });
  const hullGeo = new THREE.BoxGeometry(0.86, 0.86, 0.86);
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.position.y = 0.44;
  hull.castShadow = true;
  hull.receiveShadow = true;
  hull.name = 'crateHull';
  root.add(hull);

  // 3. 8 Steel corner bumper brackets
  const bracketGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
  const bracketMat = new THREE.MeshStandardMaterial({
    color: isDarkMode ? 0x475569 : 0x64748b,
    metalness: 0.85,
    roughness: 0.2,
  });

  const bOffset = 0.38;
  const corners = [
    [-bOffset, 0.44 - bOffset, -bOffset],
    [bOffset, 0.44 - bOffset, -bOffset],
    [-bOffset, 0.44 - bOffset, bOffset],
    [bOffset, 0.44 - bOffset, bOffset],
    [-bOffset, 0.44 + bOffset, -bOffset],
    [bOffset, 0.44 + bOffset, -bOffset],
    [-bOffset, 0.44 + bOffset, bOffset],
    [bOffset, 0.44 + bOffset, bOffset],
  ];

  corners.forEach(([cx, cy, cz]) => {
    const bracket = new THREE.Mesh(bracketGeo, bracketMat);
    bracket.position.set(cx, cy, cz);
    bracket.castShadow = true;
    root.add(bracket);
  });

  // 4. Center Glowing Energy Core / Magnetic Socket (glows gold when idle, brilliant emerald green when placed on target)
  const coreGeo = new THREE.SphereGeometry(0.12, 16, 16);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b, // amber idle
    emissive: 0xd97706,
    emissiveIntensity: 0.7,
    roughness: 0.15,
    metalness: 0.2,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.set(0, 0.88, 0);
  core.name = 'crateCore';
  root.add(core);

  // 5. Top grab handle
  const handleGeo = new THREE.TorusGeometry(0.14, 0.025, 8, 16);
  handleGeo.rotateX(Math.PI / 2);
  const handle = new THREE.Mesh(handleGeo, bracketMat);
  handle.position.set(0, 0.89, 0);
  root.add(handle);

  return root;
}

/**
 * Creates Target Pad / Pressure Plate:
 * Composite 3-part recessed floor socket with dynamic emissive glow.
 */
export function createTargetGroup(isActive: boolean = false): THREE.Group {
  const root = new THREE.Group();
  root.name = 'targetRoot';

  // Base recessed socket plate
  const plateGeo = new THREE.BoxGeometry(0.92, 0.04, 0.92);
  const plateMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.8,
    roughness: 0.3,
  });
  const plate = new THREE.Mesh(plateGeo, plateMat);
  plate.position.y = 0.02;
  plate.receiveShadow = true;
  root.add(plate);

  // Glowing graphic ring
  const targetTex = createTargetTexture(isActive);
  const decalGeo = new THREE.PlaneGeometry(0.86, 0.86);
  const decalMat = new THREE.MeshBasicMaterial({
    map: targetTex,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const decal = new THREE.Mesh(decalGeo, decalMat);
  decal.rotation.x = -Math.PI / 2;
  decal.position.y = 0.045;
  decal.name = 'targetDecal';
  root.add(decal);

  // Upward beacon cylinder (subtle ambient column)
  const beamGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.6, 16, 1, true);
  const beamMat = new THREE.MeshBasicMaterial({
    color: isActive ? 0x10b981 : 0xf59e0b,
    transparent: true,
    opacity: isActive ? 0.35 : 0.15,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.position.y = 0.34;
  beam.name = 'targetBeam';
  root.add(beam);

  return root;
}

/**
 * Creates Industrial Wall Column:
 * Composite 3-part architectural pillar.
 */
export function createWallGroup(isDarkMode: boolean = true): THREE.Group {
  const root = new THREE.Group();

  // Foundation base skirt
  const baseGeo = new THREE.BoxGeometry(0.98, 0.12, 0.98);
  const baseMat = new THREE.MeshStandardMaterial({
    color: isDarkMode ? 0x1e293b : 0x475569,
    metalness: 0.7,
    roughness: 0.4,
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.06;
  base.castShadow = true;
  base.receiveShadow = true;
  root.add(base);

  // Main column body
  const bodyGeo = new THREE.BoxGeometry(0.92, 0.9, 0.92);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: isDarkMode ? 0x0f172a : 0x334155,
    metalness: 0.5,
    roughness: 0.5,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.55;
  body.castShadow = true;
  body.receiveShadow = true;
  root.add(body);

  // Top metallic beveled cap
  const capGeo = new THREE.BoxGeometry(0.96, 0.08, 0.96);
  const capMat = new THREE.MeshStandardMaterial({
    color: isDarkMode ? 0x334155 : 0x64748b,
    metalness: 0.85,
    roughness: 0.25,
  });
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.y = 1.04;
  cap.castShadow = true;
  root.add(cap);

  // Vertical subtle status stripe
  const stripeGeo = new THREE.BoxGeometry(0.08, 0.7, 0.94);
  const stripeMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // tech blue accent
    emissive: 0x0369a1,
    emissiveIntensity: 0.3,
    roughness: 0.2,
  });
  const stripe = new THREE.Mesh(stripeGeo, stripeMat);
  stripe.position.y = 0.55;
  root.add(stripe);

  return root;
}

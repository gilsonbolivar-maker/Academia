import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  createPlayerRobot,
  createCrateGroup,
  createTargetGroup,
  createWallGroup,
  getFloorTexture,
} from './models';
import { CameraPreset, Direction, LevelData, Position } from '../types/game';

// Scratch math helpers outside render loop to prevent garbage collection
const _targetCameraPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3();

export interface SceneManagerOptions {
  container: HTMLDivElement;
  onAnimationStepDone?: () => void;
  isDarkMode: boolean;
}

export class SceneManager {
  private container: HTMLDivElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private pmremGenerator!: THREE.PMREMGenerator;

  private keyLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;
  private ambientLight!: THREE.AmbientLight;

  private playerGroup: THREE.Group | null = null;
  private crateGroups: Map<number, THREE.Group> = new Map();
  private targetGroups: Map<string, THREE.Group> = new Map();
  private staticEnvironmentGroup: THREE.Group = new THREE.Group();

  private animFrameId: number = 0;
  private clock: THREE.Clock = new THREE.Clock();

  // Camera presets and damping state
  private cameraPreset: CameraPreset = 'isometric';
  private cameraDistance: number = 10;
  private currentGridCenter: { x: number; z: number } = { x: 0, z: 0 };
  private gridDimensions: { w: number; h: number } = { w: 6, h: 6 };

  // Smooth entity positions
  private targetPlayerPos = new THREE.Vector3();
  private targetPlayerRotY: number = 0;
  private targetCratePositions: Map<number, THREE.Vector3> = new Map();

  private isDarkMode: boolean = true;
  private isPullingVisual: boolean = false;
  private isDestroyed: boolean = false;

  constructor(options: SceneManagerOptions) {
    this.container = options.container;
    this.isDarkMode = options.isDarkMode;

    this.initScene();
    this.initRenderer();
    this.initLighting();
    this.initEnvironment();

    window.addEventListener('resize', this.onWindowResize);
    this.animate();
  }

  private initScene() {
    this.scene = new THREE.Scene();
    this.applyThemeColors();
  }

  private applyThemeColors() {
    if (!this.scene) return;
    if (this.isDarkMode) {
      this.scene.background = new THREE.Color(0x0a0f1d);
      this.scene.fog = new THREE.FogExp2(0x0a0f1d, 0.04);
    } else {
      // Contemporary soft stone / travertine light palette
      this.scene.background = new THREE.Color(0xf1f5f9);
      this.scene.fog = new THREE.FogExp2(0xf1f5f9, 0.035);
    }
  }

  private initRenderer() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);

    const isHeadless = typeof navigator !== 'undefined' && (/HeadlessChrome/i.test(navigator.userAgent) || navigator.webdriver);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = this.isDarkMode ? 1.15 : 1.05;
    this.renderer.shadowMap.enabled = !isHeadless;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // Procedural Studio Environment for PBR metallic reflections
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    this.scene.environment = this.pmremGenerator.fromScene(roomEnv, 0.04).texture;
    roomEnv.dispose();

    this.scene.add(this.staticEnvironmentGroup);
  }

  private initLighting() {
    // Warm key light with tight shadow frustum
    this.keyLight = new THREE.DirectionalLight(0xfffaed, this.isDarkMode ? 2.4 : 1.9);
    this.keyLight.position.set(7, 14, 8);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 35;
    this.keyLight.shadow.camera.left = -10;
    this.keyLight.shadow.camera.right = 10;
    this.keyLight.shadow.camera.top = 10;
    this.keyLight.shadow.camera.bottom = -10;
    this.keyLight.shadow.bias = -0.0005;
    this.keyLight.shadow.normalBias = 0.02;
    this.scene.add(this.keyLight);

    // Cool fill light
    this.hemiLight = new THREE.HemisphereLight(
      this.isDarkMode ? 0x93c5fd : 0xffffff,
      this.isDarkMode ? 0x1e293b : 0xe2e8f0,
      this.isDarkMode ? 0.9 : 0.75
    );
    this.scene.add(this.hemiLight);

    // Subtle ambient
    this.ambientLight = new THREE.AmbientLight(0xffffff, this.isDarkMode ? 0.35 : 0.45);
    this.scene.add(this.ambientLight);
  }

  private initEnvironment() {
    // Build infinite grounded floor plane
    const floorGeo = new THREE.PlaneGeometry(120, 120);
    const floorTex = getFloorTexture();
    floorTex.repeat.set(40, 40);

    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      metalness: 0.7,
      roughness: 0.4,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0;
    floorMesh.receiveShadow = true;
    this.staticEnvironmentGroup.add(floorMesh);
  }

  public setDarkMode(isDark: boolean) {
    this.isDarkMode = isDark;
    this.applyThemeColors();
    if (this.keyLight) {
      this.keyLight.intensity = isDark ? 2.4 : 1.9;
    }
    if (this.renderer) {
      this.renderer.toneMappingExposure = isDark ? 1.15 : 1.05;
    }
  }

  public setCameraPreset(preset: CameraPreset) {
    this.cameraPreset = preset;
  }

  public loadLevel(level: LevelData) {
    this.gridDimensions = { w: level.gridWidth, h: level.gridHeight };
    const centerX = (level.gridWidth - 1) / 2;
    const centerZ = (level.gridHeight - 1) / 2;
    this.currentGridCenter = { x: centerX, z: centerZ };

    // Clear dynamic objects
    if (this.playerGroup) {
      this.scene.remove(this.playerGroup);
      this.playerGroup = null;
    }
    this.crateGroups.forEach(group => this.scene.remove(group));
    this.crateGroups.clear();
    this.targetGroups.forEach(group => this.scene.remove(group));
    this.targetGroups.clear();

    // Clear previous walls in staticEnvironmentGroup (keep index 0 which is floor)
    while (this.staticEnvironmentGroup.children.length > 1) {
      this.staticEnvironmentGroup.remove(this.staticEnvironmentGroup.children[1]);
    }

    // Spawn Walls
    level.walls.forEach(pos => {
      const wall = createWallGroup(this.isDarkMode);
      wall.position.set(pos.x - centerX, 0, pos.y - centerZ);
      this.staticEnvironmentGroup.add(wall);
    });

    // Spawn Targets
    level.targets.forEach(pos => {
      const targetGroup = createTargetGroup(false);
      targetGroup.position.set(pos.x - centerX, 0, pos.y - centerZ);
      const key = `${pos.x},${pos.y}`;
      this.targetGroups.set(key, targetGroup);
      this.scene.add(targetGroup);
    });

    // Spawn Crates
    this.targetCratePositions.clear();
    level.crates.forEach((pos, idx) => {
      const crateGroup = createCrateGroup(this.isDarkMode);
      const wx = pos.x - centerX;
      const wz = pos.y - centerZ;
      crateGroup.position.set(wx, 0, wz);
      this.crateGroups.set(idx, crateGroup);
      this.targetCratePositions.set(idx, new THREE.Vector3(wx, 0, wz));
      this.scene.add(crateGroup);
    });

    // Spawn Player Robot
    this.playerGroup = createPlayerRobot(this.isDarkMode);
    const px = level.playerStart.x - centerX;
    const pz = level.playerStart.y - centerZ;
    this.playerGroup.position.set(px, 0, pz);
    this.targetPlayerPos.set(px, 0, pz);
    this.targetPlayerRotY = 0;
    this.scene.add(this.playerGroup);

    // Initial camera snap to optimal framing distance
    const maxDim = Math.max(level.gridWidth, level.gridHeight);
    this.cameraDistance = Math.max(9, maxDim * 1.35);

    this.updateCameraInstant();
  }

  public updateGameState(
    playerPos: Position,
    facing: Direction,
    crates: { id: number; x: number; y: number }[],
    targets: { x: number; y: number }[],
    isPulling: boolean
  ) {
    const centerX = this.currentGridCenter.x;
    const centerZ = this.currentGridCenter.z;

    // Update target player position
    this.targetPlayerPos.set(playerPos.x - centerX, 0, playerPos.y - centerZ);

    // Update target player rotation based on facing
    let angle = 0;
    switch (facing) {
      case 'N': angle = Math.PI; break;
      case 'S': angle = 0; break;
      case 'E': angle = Math.PI / 2; break;
      case 'W': angle = -Math.PI / 2; break;
    }
    this.targetPlayerRotY = angle;

    // Update pulling visual state
    this.isPullingVisual = isPulling;

    // Update target crate positions & target glowing activation state
    crates.forEach(c => {
      const wx = c.x - centerX;
      const wz = c.y - centerZ;
      const targetVec = this.targetCratePositions.get(c.id);
      if (targetVec) {
        targetVec.set(wx, 0, wz);
      }

      // Check if crate is on any target pad
      const isOnTarget = targets.some(t => t.x === c.x && t.y === c.y);
      const crateMesh = this.crateGroups.get(c.id);
      if (crateMesh) {
        const core = crateMesh.getObjectByName('crateCore') as THREE.Mesh;
        if (core && core.material) {
          const mat = core.material as THREE.MeshStandardMaterial;
          mat.color.setHex(isOnTarget ? 0x10b981 : 0xf59e0b);
          mat.emissive.setHex(isOnTarget ? 0x059669 : 0xd97706);
          mat.emissiveIntensity = isOnTarget ? 1.2 : 0.7;
        }
      }
    });

    // Update target pads activation state
    targets.forEach(t => {
      const key = `${t.x},${t.y}`;
      const hasCrate = crates.some(c => c.x === t.x && c.y === t.y);
      const targetGroup = this.targetGroups.get(key);
      if (targetGroup) {
        const beam = targetGroup.getObjectByName('targetBeam') as THREE.Mesh;
        if (beam && beam.material) {
          const mat = beam.material as THREE.MeshBasicMaterial;
          mat.color.setHex(hasCrate ? 0x10b981 : 0xf59e0b);
          mat.opacity = hasCrate ? 0.45 : 0.15;
        }
      }
    });
  }

  private updateCameraInstant() {
    this.computeTargetCameraPos(_targetCameraPos, _targetLookAt);
    this.camera.position.copy(_targetCameraPos);
    _currentLookAt.copy(_targetLookAt);
    this.camera.lookAt(_currentLookAt);
  }

  private computeTargetCameraPos(outPos: THREE.Vector3, outLookAt: THREE.Vector3) {
    const d = this.cameraDistance;

    switch (this.cameraPreset) {
      case 'isometric':
        outPos.set(d * 0.7, d * 0.9, d * 0.75);
        outLookAt.set(0, 0.4, 0);
        break;
      case 'topDown':
        outPos.set(0.001, d * 1.35, 0.001);
        outLookAt.set(0, 0, 0);
        break;
      case 'cinematic':
        if (this.playerGroup) {
          // Dynamic chase camera slightly elevated behind player
          const px = this.playerGroup.position.x;
          const pz = this.playerGroup.position.z;
          outPos.set(px + 4.5, 5.5, pz + 5.5);
          outLookAt.set(px, 0.6, pz);
        } else {
          outPos.set(d * 0.7, d * 0.9, d * 0.75);
          outLookAt.set(0, 0.4, 0);
        }
        break;
    }
  }

  private animate = () => {
    if (this.isDestroyed) return;
    this.animFrameId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const dampFactor = 1 - Math.exp(-14 * delta);
    const rotDampFactor = 1 - Math.exp(-18 * delta);

    // 1. Smoothly interpolate player robot position and rotation
    if (this.playerGroup) {
      this.playerGroup.position.lerp(this.targetPlayerPos, dampFactor);

      // Shortest angle interpolation for Y rotation
      let diff = this.targetPlayerRotY - this.playerGroup.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.playerGroup.rotation.y += diff * rotDampFactor;

      // Subtle bobbing of the head and antenna
      const head = this.playerGroup.getObjectByName('botHead');
      if (head) {
        head.position.y = 0.62 + Math.sin(this.clock.getElapsedTime() * 4) * 0.015;
      }

      // Tractor beam visibility when pulling
      const beam = this.playerGroup.getObjectByName('tractorBeamMesh') as THREE.Mesh;
      if (beam && beam.material) {
        const mat = beam.material as THREE.MeshBasicMaterial;
        const targetOpacity = this.isPullingVisual ? 0.45 : 0;
        mat.opacity += (targetOpacity - mat.opacity) * (1 - Math.exp(-20 * delta));
      }
    }

    // 2. Smoothly interpolate crates
    this.crateGroups.forEach((group, id) => {
      const targetVec = this.targetCratePositions.get(id);
      if (targetVec) {
        group.position.lerp(targetVec, dampFactor);
      }
    });

    // 3. Smoothly damp camera position and target
    this.computeTargetCameraPos(_targetCameraPos, _targetLookAt);
    this.camera.position.lerp(_targetCameraPos, 1 - Math.exp(-6 * delta));
    _currentLookAt.lerp(_targetLookAt, 1 - Math.exp(-6 * delta));
    this.camera.lookAt(_currentLookAt);

    // 4. Render
    this.renderer.render(this.scene, this.camera);
  };

  private onWindowResize = () => {
    if (!this.container || this.isDestroyed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public destroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.onWindowResize);

    if (this.pmremGenerator) {
      this.pmremGenerator.dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
  }
}

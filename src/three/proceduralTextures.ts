import * as THREE from 'three';

// Create procedural CanvasTextures (zero external images / zero 404s)

export function createFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Subtle clean tech slate background
  ctx.fillStyle = '#1e2430';
  ctx.fillRect(0, 0, 512, 512);

  // Grid inner panel
  ctx.fillStyle = '#252d3d';
  ctx.fillRect(16, 16, 480, 480);

  // Subtle cross hatching dots
  ctx.fillStyle = '#343f54';
  for (let x = 64; x < 512; x += 64) {
    for (let y = 64; y < 512; y += 64) {
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Corner tech brackets
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 3;
  const bracketSize = 32;
  // Top-left
  ctx.strokeRect(28, 28, bracketSize, bracketSize);
  // Top-right
  ctx.strokeRect(512 - 28 - bracketSize, 28, bracketSize, bracketSize);
  // Bottom-left
  ctx.strokeRect(28, 512 - 28 - bracketSize, bracketSize, bracketSize);
  // Bottom-right
  ctx.strokeRect(512 - 28 - bracketSize, 512 - 28 - bracketSize, bracketSize, bracketSize);

  // Outer border bevel
  ctx.strokeStyle = '#111622';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, 504, 504);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createCrateTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Metallic warm bronze/amber container face
  ctx.fillStyle = '#d97706'; // Vibrant amber
  ctx.fillRect(0, 0, 512, 512);

  // Inset panel
  ctx.fillStyle = '#b45309';
  ctx.fillRect(40, 40, 432, 432);

  // Hazard diagonal stripes across center band
  ctx.save();
  ctx.beginPath();
  ctx.rect(40, 180, 432, 152);
  ctx.clip();

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(40, 180, 432, 152);

  ctx.fillStyle = '#f59e0b';
  for (let i = -200; i < 700; i += 60) {
    ctx.beginPath();
    ctx.moveTo(i, 180);
    ctx.lineTo(i + 30, 180);
    ctx.lineTo(i - 30, 332);
    ctx.lineTo(i - 60, 332);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Central magnetic icon symbol (Push/Pull arrows)
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(256, 256, 44, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#fef3c7';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(256, 256, 34, 0, Math.PI * 2);
  ctx.stroke();

  // Heavy rivet corners
  ctx.fillStyle = '#64748b';
  const rivetOffset = 24;
  [
    [rivetOffset, rivetOffset],
    [512 - rivetOffset, rivetOffset],
    [rivetOffset, 512 - rivetOffset],
    [512 - rivetOffset, 512 - rivetOffset],
    [256, rivetOffset],
    [256, 512 - rivetOffset],
    [rivetOffset, 256],
    [512 - rivetOffset, 256],
  ].forEach(([rx, ry]) => {
    ctx.beginPath();
    ctx.arc(rx, ry, 8, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createTargetTexture(isActive: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 512, 512);

  // Outer ring
  const baseColor = isActive ? '#10b981' : '#f59e0b';
  const glowColor = isActive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.3)';

  // Soft glowing disc
  const gradient = ctx.createRadialGradient(256, 256, 40, 256, 256, 240);
  gradient.addColorStop(0, glowColor);
  gradient.addColorStop(0.8, 'transparent');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(256, 256, 240, 0, Math.PI * 2);
  ctx.fill();

  // Outer segmented ring
  ctx.strokeStyle = baseColor;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(256, 256, 210, 0, Math.PI * 2);
  ctx.stroke();

  // 4 corner arrow chevrons pointing inward
  ctx.fillStyle = baseColor;
  const chevrons = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  chevrons.forEach(angle => {
    ctx.save();
    ctx.translate(256, 256);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, -180);
    ctx.lineTo(24, -150);
    ctx.lineTo(-24, -150);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });

  // Center bullseye pad
  ctx.beginPath();
  ctx.arc(256, 256, 60, 0, Math.PI * 2);
  ctx.fillStyle = baseColor;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(256, 256, 30, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

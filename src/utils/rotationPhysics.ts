/**
 * 3D Rotation Physics for Bloch Sphere State Vectors
 *
 * In Qubify convention:
 *   TOP: |0⟩ = +Z  (theta = 0)
 *   BOTTOM: |1⟩ = -Z  (theta = PI)
 *   RIGHT: |+⟩ = +X  (theta = PI/2, phi = 0)
 *   LEFT: |−⟩ = -X  (theta = PI/2, phi = PI)
 *   FRONT (out of screen): |+i⟩ = +Y (theta = PI/2, phi = PI/2)
 *   BACK (into screen): |−i⟩ = -Y (theta = PI/2, phi = 3PI/2)
 *
 * Given spherical angles (theta, phi):
 *   z = cos(theta)
 *   x = sin(theta) * cos(phi)
 *   y = sin(theta) * sin(phi)
 */

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface SphericalCoords {
  theta: number;
  phi: number;
}

export function sphericalToCartesian(theta: number, phi: number): Vector3D {
  const z = Math.cos(theta);
  const sinT = Math.sin(theta);
  const x = sinT * Math.cos(phi);
  const y = sinT * Math.sin(phi);
  return { x, y, z };
}

export function cartesianToSpherical(v: Vector3D): SphericalCoords {
  // Normalize vector to unit sphere
  const len = Math.hypot(v.x, v.y, v.z);
  const nx = len === 0 ? 0 : v.x / len;
  const ny = len === 0 ? 0 : v.y / len;
  const nz = len === 0 ? 1 : Math.max(-1, Math.min(1, v.z / len));

  const theta = Math.acos(nz);
  let phi = Math.atan2(ny, nx);
  if (phi < 0) {
    phi += 2 * Math.PI;
  }
  return { theta, phi };
}

/**
 * Rodrigues' rotation formula:
 * v_rot = v*cos(angle) + (axis x v)*sin(angle) + axis*(axis . v)*(1 - cos(angle))
 */
export function rotateVectorAroundAxis(
  v: Vector3D,
  axis: 'X' | 'Y' | 'Z',
  angleDeg: number
): Vector3D {
  const rad = (angleDeg * Math.PI) / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);

  const ax = axis === 'X' ? 1 : 0;
  const ay = axis === 'Y' ? 1 : 0;
  const az = axis === 'Z' ? 1 : 0;

  // Dot product
  const dot = ax * v.x + ay * v.y + az * v.z;

  // Cross product (axis x v)
  const cx = ay * v.z - az * v.y;
  const cy = az * v.x - ax * v.z;
  const cz = ax * v.y - ay * v.x;

  const rx = v.x * cosA + cx * sinA + ax * dot * (1 - cosA);
  const ry = v.y * cosA + cy * sinA + ay * dot * (1 - cosA);
  const rz = v.z * cosA + cz * sinA + az * dot * (1 - cosA);

  return { x: rx, y: ry, z: rz };
}

/**
 * Calculates (theta, phi) for rotating a state (startTheta, startPhi)
 * around an axis ('X' | 'Y' | 'Z') by angleDeg degrees.
 */
export function getRotatedState(
  startTheta: number,
  startPhi: number,
  axis: 'X' | 'Y' | 'Z',
  angleDeg: number
): SphericalCoords & { v: Vector3D } {
  const vStart = sphericalToCartesian(startTheta, startPhi);
  const vRot = rotateVectorAroundAxis(vStart, axis, angleDeg);
  const { theta, phi } = cartesianToSpherical(vRot);
  return { theta, phi, v: vRot };
}

/**
 * Calculates P(0) and P(1) from theta
 * P(0) = cos^2(theta/2)
 * P(1) = sin^2(theta/2)
 */
export function getMeasurementProbabilities(theta: number): { p0: number; p1: number } {
  const p0 = Math.round(Math.pow(Math.cos(theta / 2), 2) * 100);
  const p1 = 100 - p0;
  return { p0, p1 };
}

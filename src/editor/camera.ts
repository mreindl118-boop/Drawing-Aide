import * as THREE from 'three';
import type { CameraState } from '../core/types';

const _v = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _axis = new THREE.Vector3();

/** Trackball-style orbit rig: full free rotation (needed for 2-finger twist
 *  roll) around a target point. Camera state = target + orientation + dist. */
export class CameraRig {
  camera = new THREE.PerspectiveCamera(50, 1, 0.02, 500);
  target = new THREE.Vector3(0, 0.5, 0);
  quat = new THREE.Quaternion();
  dist = 6;
  onChange: (() => void) | null = null;

  constructor() {
    this.quat.setFromEuler(new THREE.Euler(-0.42, 0.55, 0, 'YXZ'));
    this.apply();
  }

  apply(): void {
    this.camera.quaternion.copy(this.quat);
    _v.set(0, 0, this.dist).applyQuaternion(this.quat);
    this.camera.position.copy(this.target).add(_v);
    this.camera.updateMatrixWorld();
    this.onChange?.();
  }

  orbit(dx: number, dy: number): void {
    const s = 0.0055;
    _axis.set(0, 1, 0).applyQuaternion(this.quat);
    _q.setFromAxisAngle(_axis, -dx * s);
    this.quat.premultiply(_q);
    _axis.set(1, 0, 0).applyQuaternion(this.quat);
    _q.setFromAxisAngle(_axis, -dy * s);
    this.quat.premultiply(_q);
    this.apply();
  }

  roll(dAngle: number): void {
    _axis.set(0, 0, -1).applyQuaternion(this.quat);
    _q.setFromAxisAngle(_axis, dAngle);
    this.quat.premultiply(_q);
    this.apply();
  }

  pan(dxPx: number, dyPx: number, viewportHeightPx: number): void {
    const worldPerPx =
      (2 * this.dist * Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2)) /
      Math.max(1, viewportHeightPx);
    _axis.set(1, 0, 0).applyQuaternion(this.quat);
    this.target.addScaledVector(_axis, -dxPx * worldPerPx);
    _axis.set(0, 1, 0).applyQuaternion(this.quat);
    this.target.addScaledVector(_axis, dyPx * worldPerPx);
    this.apply();
  }

  dolly(factor: number): void {
    this.dist = THREE.MathUtils.clamp(this.dist * factor, 0.08, 250);
    this.apply();
  }

  /** Frame a bounding box (or reset to home) and level the horizon. */
  frame(box: THREE.Box3 | null): void {
    let center: THREE.Vector3;
    let radius: number;
    if (box && !box.isEmpty()) {
      center = box.getCenter(new THREE.Vector3());
      radius = Math.max(0.5, box.getSize(new THREE.Vector3()).length() / 2);
    } else {
      center = new THREE.Vector3(0, 0.5, 0);
      radius = 2.2;
    }
    this.target.copy(center);
    this.dist = radius * 2.4;
    // keep view direction, remove roll: rebuild orientation with world up
    const dir = _v.set(0, 0, -1).applyQuaternion(this.quat);
    if (Math.abs(dir.y) > 0.98) dir.set(0, -0.4, -1).normalize();
    const m = new THREE.Matrix4().lookAt(
      new THREE.Vector3(),
      dir,
      new THREE.Vector3(0, 1, 0)
    );
    this.quat.setFromRotationMatrix(m);
    this.apply();
  }

  forward(): THREE.Vector3 {
    return new THREE.Vector3(0, 0, -1).applyQuaternion(this.quat);
  }

  state(): CameraState {
    return {
      target: [this.target.x, this.target.y, this.target.z],
      quat: [this.quat.x, this.quat.y, this.quat.z, this.quat.w],
      dist: this.dist
    };
  }

  setState(s: CameraState): void {
    this.target.set(...s.target);
    this.quat.set(...s.quat);
    this.dist = s.dist;
    this.apply();
  }

  setViewport(w: number, h: number): void {
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
  }
}

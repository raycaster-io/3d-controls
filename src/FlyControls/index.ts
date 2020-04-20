import { Euler, Object3D, Vector3 } from 'three';
import { HALF_PI } from '../constants/math';

enum Direction {
  Forward = 'Forward',
  Left = 'Left',
  Backward = 'Backward',
  Right = 'Right'
};

const KeyMovementMap = {
  w: Direction.Forward,
  a: Direction.Left,
  s: Direction.Backward,
  d: Direction.Right
};

export class FlyControls {
  object: Object3D;
  domElement: HTMLCanvasElement;
  movementSpeed = 1.0;
  lookSpeed = 1.0;
  euler = new Euler(0, 0, 0, 'YXZ');
  activeDirections = {
    [Direction.Forward]: false,
    [Direction.Left]: false,
    [Direction.Backward]: false,
    [Direction.Right]: false
  };

  constructor(object, domElement) {
    this.object = object;
    this.domElement = domElement;

    this.domElement.addEventListener('click', this.requestPointerLock);
    this.domElement.addEventListener('mousemove', this.look);
    window.addEventListener('keydown', this.move);
    window.addEventListener('keyup', this.stop);
  }

  dispose() {
    this.domElement.removeEventListener('click', this.requestPointerLock);
    this.domElement.removeEventListener('mousemove', this.look);
    window.removeEventListener('keydown', this.move);
    window.addEventListener('keyup', this.stop);
  }

  requestPointerLock = () => {
    this.domElement.requestPointerLock();
  }

  look = (event: MouseEvent) => {
    const { movementX, movementY } = event;
    const lookMultiplier = this.lookSpeed * 0.001;

    this.euler.setFromQuaternion(this.object.quaternion);

    this.euler.y -= movementX * lookMultiplier;
    this.euler.x -= movementY * lookMultiplier;
    this.euler.x = Math.max(-HALF_PI, Math.min(HALF_PI, this.euler.x));

    this.object.quaternion.setFromEuler(this.euler);
  }

  move = (event: KeyboardEvent) => {
    const direction = KeyMovementMap[event.key.toLowerCase()];
    this.activeDirections[direction] = true;
  }

  stop = (event: KeyboardEvent) => {
    const direction = KeyMovementMap[event.key.toLowerCase()];
    this.activeDirections[direction] = false;
  }

  update = (delta: number, onUpdatePosition?: (position: Vector3) => any) => {
    const movementValue = this.movementSpeed * delta;

    for (let [direction, active] of Object.entries(this.activeDirections)) {
      if (active) {
        this.calculatePosition(direction, movementValue);
        onUpdatePosition(this.object.position);
      }
    }
  }

  calculatePosition = (direction: string, movementValue: number) => {
    switch (direction) {
      case Direction.Forward:
        return this.object.translateZ(-movementValue);
      case Direction.Left:
        return this.object.translateX(-movementValue);
      case Direction.Backward:
        return this.object.translateZ(movementValue);
      case Direction.Right:
        return this.object.translateX(movementValue);
    }
  }
}
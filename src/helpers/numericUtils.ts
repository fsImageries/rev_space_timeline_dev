// import * as THREE from "three";
// import { randFloat } from "three/src/math/MathUtils";

import { Euler, Matrix4, Quaternion, Vector3 } from "three";
import { randFloat } from "three/src/math/MathUtils";
import { RandStats } from "../interfaces";

// export const randFloatExcludes = function (start: number, end: number, excludeStart: number, excludeEnd: number) {
//   let number = 0;
//   while (number >= start && number <= end && excludeStart <= number && number <= excludeEnd) {
//     number = randFloat(start, end);
//   }
//   return number;
// };

export const inSphere = (pos: number[], spherePos: number[], rad: number) => {
  const diff = spherePos.map((sp, idx) => sp - pos[idx]);
  const dist = Math.sqrt(diff[0] ** 2 + diff[1] ** 2 + diff[2] ** 2);
  return dist < rad;
};

export const randSpherePointExcludes = (r: number, mult = 1) => {
  const base = [0, 0, 0];
  let pnt = [0, 0, 0];
  while (inSphere(pnt, base, r)) {
    pnt = randSpherePoint(mult);
  }
  return pnt;
};

export const randSpherePoint = (mult = 1) => {
  const u = Math.random();
  const v = Math.random();
  const theta = u * 2.0 * Math.PI;
  const phi = Math.acos(2.0 * v - 1.0);
  const r = Math.cbrt(Math.random());
  const sinTheta = Math.sin(theta);
  const cosTheta = Math.cos(theta);
  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);
  const x = r * sinPhi * cosTheta;
  const y = r * sinPhi * sinTheta;
  const z = r * cosPhi;
  // return {x: x, y: y, z: z};
  return [x * mult, y * mult, z * mult];
};

// export function relaxRingPoints(points: number[], height: number, end = 1, mult = 1) {
//   for (let cur_i = 0; cur_i < points.length; cur_i += 3) {
//     points[cur_i + 1] += randFloat(-mult * height, mult * height); // y
//     points[cur_i] += randFloat(-mult * 27.5 * end, mult * 32.5 * end); // x
//     points[cur_i + 2] += randFloat(-mult * 32.5 * end, mult * 27.5 * end); // z
//     const cur = [points[cur_i], points[cur_i + 1], points[cur_i + 2]];

//     for (let other_i = 0; other_i < points.length; other_i += 3) {
//       if (cur_i == other_i) continue;
//       const other = [points[other_i], points[other_i + 1], points[other_i + 2]];
//       if (inSphere(other, cur, mult)) {
//         points[other_i + 1] += randFloat(-mult, mult);
//       }
//     }
//   }
//   return points;
// }

// // https://karthikkaranth.me/blog/generating-random-points-in-a-sphere/

export const randomizeMatrix = (function () {
  const position = new Vector3();
  const rotation = new Euler();
  const quaternion = new Quaternion();
  const scale = new Vector3();

  return function (matrix: Matrix4, stats: RandStats) {
    const [x, y, z] = randSpherePointExcludes(stats.distanceStart, stats.distanceEnd);
    position.x = x;
    position.y = y;
    position.z = z;

    rotation.x = Math.random() * 2 * Math.PI;
    rotation.y = Math.random() * 2 * Math.PI;
    rotation.z = Math.random() * 2 * Math.PI;

    quaternion.setFromEuler(rotation);

    scale.x = scale.y = scale.z = randFloat(2, 1000);

    matrix.compose(position, quaternion, scale);
  };
})();

import * as THREE from "three";
import { Text } from "troika-three-text";

import { Planet } from "../Models/Planet";
import { uuidv4 } from "../helpers/utils";
import { SystemObjectData } from "../jsonInterfaces";
import build_orbit from "./OrbitFactory";

import { randFloat } from "three/src/math/MathUtils";
import CelestialBase from "../Classes/CelestialBase";
import Internal3DObject from "../Classes/Internal3DObject";
import Constants from "../helpers/Constants";
import atmoFrag from "./../glsl/planet_atmo.frag.glsl?raw";
import atmoVert from "./../glsl/planet_atmo.vert.glsl?raw";

export default function build(data: SystemObjectData) {
  Constants.LOAD_MANAGER.itemStart(`://${data.name}_planet`);

  const [mesh, atmo] = build_sphere_mesh_and_atmo(
    new THREE.Color(parseInt(data.draw.glowColor)),
    data.draw.glowIntensity,
    data.draw.albedoPath,
    data.draw.normalPath,
    data.radius / Constants.SIZE_SCALE, //data.draw.radius,
    data.name
  );

  const masterGrp = new THREE.Group();
  masterGrp.name = `${data.name}_masterGrp`;

  const parentGrp = new THREE.Group();
  parentGrp.name = `${data.name}_parentGrp`;
  parentGrp.add(masterGrp);

  const meshGrp = new THREE.Group();
  meshGrp.name = `${data.name}_meshGrp`;
  meshGrp.add(mesh);
  meshGrp.add(atmo);
  masterGrp.add(meshGrp);

  const orbit = build_orbit(data.draw);
  masterGrp.add(orbit);

  let markerSprite;
  if (!data.type.includes("moon")) {
    const map = Constants.TEX_LOAD("./diamond-solid.svg");
    const material = new THREE.SpriteMaterial({ map: map });
    markerSprite = new THREE.Sprite(material);
    markerSprite.name = `${data.name}_markerSprite`
    markerSprite.position.y = data.draw.radius + data.draw.radius / 3;
    masterGrp.add(markerSprite);
  }

  const celestialData = new CelestialBase({
    id: uuidv4(),
    name: data.name,
    type: data.type,
    tilt: data.tilt,
    parent: data.parent,
    radius: data.radius,
    texts: data.texts,
    orbitalPeriod: data.orbitalPeriod,
    rotationPeriod: data.rotationPeriod,
    distanceToParent: data.distanceToParent,
    drawRadius: data.draw.radius
  });

  if (data.draw.orbInvert) celestialData.invertAngularOrbVel();

  parentGrp.rotation.y = randFloat(-Math.PI * randFloat(1, 2), Math.PI * randFloat(1, 2));
  const internalObject = new Internal3DObject({
    parentGrp,
    masterGrp,
    meshGrp,
    mesh,
    atmo,
    orbit,
    markerSprite,
    displayInfo: data.displayInfo
  });

  const planet = new Planet({
    data: celestialData,
    object: internalObject
  });
  Constants.LOAD_MANAGER.itemEnd(`://${data.name}_planet`);

  return planet;
}

function build_sphere_mesh_and_atmo(
  glowColor: THREE.Color,
  glowIntesity: number,
  albedoPath: string,
  normalPath: string,
  radius: number,
  name: string
) {
  const albedo = Constants.TEX_LOAD(albedoPath);
  albedo.magFilter = THREE.NearestFilter;

  const normal = Constants.TEX_LOAD(normalPath);
  normal.magFilter = THREE.NearestFilter;

  const sphereMaterial = new THREE.MeshPhongMaterial({
    map: albedo,
    normalMap: normal
  });

  const sphereGeometry = new THREE.SphereGeometry(radius, 55, 55);
  const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  mesh.castShadow = true;
  mesh.name = `${name}_mesh`;

  const atmoMat = new THREE.ShaderMaterial({
    uniforms: {
      intensityMult: { value: glowIntesity },
      viewVector: { value: new THREE.Vector3() },
      glowColor: { value: glowColor }
    },
    vertexShader: atmoVert,
    fragmentShader: atmoFrag,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -4
  });

  const atmo = new THREE.Mesh(sphereGeometry, atmoMat);
  atmo.name = `${name}_atmo`;
  atmo.castShadow = true;
  atmo.scale.set(1.5, 1.5, 1.5);

  return [mesh, atmo];
}

export function build_texts(texts: string[]) {
  return texts.map((txt, idx) => {
    const textMesh = new Text();
    textMesh.text = txt;
    textMesh.fontSize = 1;
    textMesh.color = 0xffffff;
    textMesh.userData["idx"] = idx;
    return textMesh;
  });
}

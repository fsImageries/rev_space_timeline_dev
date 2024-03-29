import { Vector3 } from "three";
import {
  RenderComponent,
  SceneComponent,
  CameraComponent,
  DistanceToParentComponent,
  AxisRotComponent,
  BaseDataComponent,
  BaseDataData,
  RadiusComponent,
  CSSMarkerComponent,
  OrbitRotComponent,
  ParentComponent,
  ParentComponentData,
  TiltComponent,
  RenderSystem,
  AxisRotSystem,
  CameraFocusSystem,
  RaycasterSystem,
  FollowCameraSystem,
  FollowCameraComponent
} from "../templates/__init__";
import { World } from "../ecs/World";
import { Entity } from "../ecs/Entity";
import { SystemObjectData } from "../dataInterfaces";

export function initCommonEntities(world: World, camPos?: Vector3) {
  // Renderer
  world.ecManager.createEntity().addComponent(RenderComponent, RenderComponent.getDefaults());

  // Renderer
  world.ecManager.createEntity().addComponent(SceneComponent, SceneComponent.getDefaults());

  // Camera
  world.ecManager.createEntity().addComponent(CameraComponent, CameraComponent.getDefaults(camPos));

  // Follow Cam
  world.ecManager.createEntity().addComponent(FollowCameraComponent, FollowCameraComponent.getDefaults());
}

export function initCelestialComponents(entity: Entity, data: SystemObjectData) {
  if (data.rotationPeriod) entity.addComponent(AxisRotComponent, AxisRotComponent.getDefaults(data.rotationPeriod));
  if (data.orbitalPeriod)
    entity.addComponent(OrbitRotComponent, OrbitRotComponent.getDefaults(data.orbitalPeriod, data.draw?.orbInvert));
  if (data.distanceToParent)
    entity.addComponent(DistanceToParentComponent, DistanceToParentComponent.getDefaults(data.distanceToParent));
  if (data.parent) entity.addComponent(ParentComponent, ParentComponent.getDefaults() as ParentComponentData); // <- determine if dynamic?
  if (data.tilt && data.tilt != 0) entity.addComponent(TiltComponent, TiltComponent.getDefaults(data.tilt));

  entity.addComponent(RadiusComponent, RadiusComponent.getDefaults(data.radius)).addComponent(BaseDataComponent, {
    name: data.name,
    uuid: crypto.randomUUID() as string,
    texts: data.texts,
    parent: data.parent
  } as BaseDataData);

  if (!data.draw?.disableMarker) entity.addComponent(CSSMarkerComponent);
}

export function initCommonSystem(world: World) {
  world.sysManager
    .registerSystem(RenderSystem)
    .registerSystem(AxisRotSystem)
    .registerSystem(CameraFocusSystem)
    .registerSystem(RaycasterSystem)
    .registerSystem(FollowCameraSystem);
}

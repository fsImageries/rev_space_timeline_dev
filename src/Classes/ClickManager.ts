import { Object3D, Raycaster, Vector2 } from "three";
import { getMasterGrp } from "../helpers/utils";
import SystemObject from "./SystemObject";
import { World } from "./World";
import Constants from "../helpers/Constants";

export class ClickManager {
  private _mousePointer: Vector2;
  private _raycaster: Raycaster;
  private _world: World;

  constructor(world: World) {
    this._mousePointer = new Vector2(Infinity, Infinity);
    this._raycaster = new Raycaster();
    this._world = world;
  }

  public initListeners() {
    window.addEventListener("dblclick", this.dblclickHandler.bind(this));
    window.addEventListener("click", this.clickHandler.bind(this));
  }

  private async clickHandler(e: MouseEvent) {
    const evTarget = e.target as HTMLElement;
    if (evTarget.id == "home") {
      await this._world.switchSystem("cosmicMap");
      return;
    }

    if (Constants.UIMANAGER.cornerButton.icons.find((el) => el.id == evTarget.id)) {
      await Constants.UIMANAGER.cornerButton.clickHandler(evTarget, this._world);
      return;
    }

    this.updateMousePointer(e);
    const res = this.checkRaycast();
    if (!res) {
      if (Constants.UIMANAGER.infoPanel.visible) Constants.UIMANAGER.infoPanel.visible = false;
      return;
    }

    const [obj, target] = res as [SystemObject, Object3D];

    // console.log(target) // TODO react when something like glitterband is clicked
    if (target.name.includes("_infoSprite")) {
      Constants.UIMANAGER.infoPanel.show(obj);
      return;
    }

    if (target.name.includes("_view")) {
      await this._world.switchSystem(target.name.replace("_view", ""));
      return;
    }

    if (Constants.UIMANAGER.infoPanel.visible) Constants.UIMANAGER.infoPanel.visible = false;
  }
  private dblclickHandler(e: MouseEvent) {
    this.updateMousePointer(e);
    const evTarget = this.raycast();
    if (!evTarget) return;
    const target = this.getMasterGroup(evTarget);
    if (!target) return;
    const obj = this._world.curSystem.getById(target.userData["id"]);
    if (!obj) return;

    this._world.cam.setFollowTarget(obj);
    this._world.cam.activateThird();
    this._world.cam.third2Free();
  }

  private updateMousePointer(e: MouseEvent) {
    this._mousePointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    this._mousePointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  private checkRaycast(): [SystemObject, Object3D] | undefined {
    const evTarget = this.raycast();
    if (!evTarget) return undefined;
    const target = this.getMasterGroup(evTarget);
    if (!target) return undefined;
    const obj = this._world.curSystem.getById(target.userData["id"]);
    if (!obj) return undefined;
    return [obj, evTarget];
  }

  private raycast() {
    this._raycaster.setFromCamera(this._mousePointer, this._world.cam.active);
    const intersects = this._raycaster.intersectObjects(this._world.curSystem.topGrp.children);
    this._mousePointer.set(Infinity, Infinity);

    if (intersects.length === 0) return undefined;

    return intersects[0].object;
  }

  public getMasterGroup(target: Object3D) {
    if (target.name != undefined && target.name.includes("_")) {
      const [name, _] = target.name.split("_");
      return this._world.scene.getObjectByName(`${name}_masterGrp`);
    }
    return getMasterGrp(target); // Fallback to brute force
  }
}

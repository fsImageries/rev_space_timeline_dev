import * as THREE from "three"
import { Planet } from "./Planet"
import { World } from "./World"
import { Sun } from "./Sun";
import { CelestialObject } from "./Celestial";
import Oort from "./Oort";
import Constants from "../helpers/Constants";
import SystemObject from "./SystemObject";
import { SystemParams } from "../interfaces";


export class System {
    public name: string;

    public topGrp: THREE.Group;
    public tree: SystemObject[];
    private flat: SystemObject[];

    public isSingleSun: boolean;
    public radius: number;

    constructor(data: SystemParams) {
        this.tree = data.tree

        this.name = data.name
        this.isSingleSun = data.isSingleSun

        this.topGrp = new THREE.Group()
        this.tree.forEach(obj => this.topGrp.add(obj.object.parentGrp))
        this.flat = data.flat
        this.radius = this.getRadius()
        console.log(this.radius)
    }

    // public get allCelestialObjects(): CelestialObject[] {
    //     return this._allCelestialObjects;
    // }

    private getRadius() {
        return this.mainSequenceObjects().reduce((acc, cur) => {
            const n = acc.dist > cur.dist ? acc : cur
            return n
        }).dist
    }

    public getById(id: string): (Sun | Planet | undefined) {
        return this.flat.reduce((acc, cur) => acc.data.id === id ? acc : cur)
    }

    public oortCloud() {
        return this.flat.reduce((acc, cur) => acc.data.type === "oortcloud" ? acc : cur)
    }

    public suns() {
        return this.flat.filter(obj => obj.data.type.includes("sun"))
    }

    public mainSequenceObjects() {
        return this.flat.filter(obj => obj.data.type.includes("sun") || obj.data.type.includes("planet") || obj.data.type.includes("moon"))
    }

    public init() {
        this.radius = this.getRadius()
        const lightRadius = (this.oortCloud() as Oort).distanceEnd/ Constants.DISTANCE_SCALE;
        (this.suns() as Sun[]).forEach(sun => sun.lightRadius = lightRadius)
        this.tree.forEach(obj => obj.init())
    }

    public initWorld(world: World) {
        this.init();
        world.scene.add(this.topGrp)
    }

    public update(world: World) {
        this.tree.forEach(obj=>obj.update(world))
    }
}
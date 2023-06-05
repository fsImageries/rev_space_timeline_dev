import * as THREE from "three"
import { Planet } from "./Planet"
import { World } from "./World"
import { Sun } from "./Sun";
import { CelestialObject } from "./Celestial";
import Oort from "./Oort";
import Constants from "../helpers/Constants";

interface Params {
    suns: Sun[];
    planets: Planet[];
    oort: Oort;
    name: string;
    isSingleSun: boolean;
}

export class System {
    private _allCelestialObjects: CelestialObject[];

    public name: string;

    public topGrp: THREE.Group;
    public planets: Planet[];
    public suns: Sun[];
    public oort: Oort;

    public isSingleSun: boolean;
    public radius: number;

    constructor(data: Params) {
        this.suns = data.suns
        this.planets = data.planets
        this.oort = data.oort
        this._allCelestialObjects = [...this.suns, ...this.planets];

        // Add all meshes to topGrp
        this.topGrp = new THREE.Group()
        this.topGrp.add(this.oort.points)
        this.allCelestialObjects.forEach(obj => this.topGrp.add(obj.topGrp))

        this.name = data.name
        this.isSingleSun = data.isSingleSun
        this.radius = this.getRadius()
        // this.allCelestialObjects.forEach(obj => obj.visible = false)
    }

    public get allCelestialObjects(): CelestialObject[] {
        return this._allCelestialObjects;
    }

    private getRadius() {
        return this.allCelestialObjects.reduce((acc, cur) => {
            const n = acc.dist > cur.dist ? acc : cur
            return n
        }).dist
    }

    public traverse(f:any) {
        let ret;

        const traversePlanet = (planet:Planet, f:any) => {
            planet.satellites?.children.forEach(child => {
                ret = f(child)
                if (ret) return
                if (child instanceof Planet) traversePlanet(child, f)
            })
        }
        this.allCelestialObjects.forEach(cel => {
            ret = f(cel)
            if (ret) return
            if (cel instanceof Planet) {
                traversePlanet(cel, f)
            }
        })
    }

    public getById(id: string): Sun | Planet | undefined {
        let found;
        this.traverse((obj:any) => {
            if (obj.id && obj.id === id) {
                found = obj
                return true
            }
            return false
        })
        return found
    }

    public init() {
        this.radius = this.getRadius();
        (this.allCelestialObjects as (Sun | Planet)[]).forEach((obj) => {
            if (obj instanceof Sun) obj.lightRadius = (this.oort.distanceEnd/ Constants.DISTANCE_SCALE)
            obj.init()
        })
        this.oort.init()
    }

    public initWorld(world: World) {
        this.init();
        world.scene.add(this.topGrp)
    }

    public update(world: World) {
        (this.suns as any).concat(this.planets).forEach((obj: Sun | Planet) => {
            obj.update(world)
        })

        this.oort.update(world)
    }
}
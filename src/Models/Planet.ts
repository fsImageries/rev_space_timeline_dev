import * as THREE from "three"
import { CelestialObject } from "./Celestial";
import Constants from "../helpers/Constants";
import { World } from "./World";
import { PlanetParams, CelestialParams } from "../interfaces";
import { Satellites } from "./Satellites";


let outWorldPos = new THREE.Vector3();

export class Planet extends CelestialObject {
    private _satellites: Satellites;

    constructor(data: CelestialParams & PlanetParams) {
        super(data);

        if (data.satellites) data.satellites.parent = this
        this._satellites = data.satellites
    }

    public get satellites(): Satellites {
        return this._satellites;
    }

    public init() {
        const base = this.parent ? this.parent.masterGrp.position.clone() : new THREE.Vector3()
        const idlePos = new THREE.Vector3(0, 0, -this.dist + this.radius * 6)
        const idlePosAdd = new THREE.Vector3(0, 0, this.radius * 6)

        base.z = -this.dist

        this.masterGrp.position.set(base.x, base.y, base.z)
        this.masterGrp.userData["idlePosition"] = idlePos;
        this.masterGrp.userData["idleAdd"] = idlePosAdd;
        this.masterGrp.userData["dist"] = this.dist;
        this.masterGrp.userData["id"] = this.id;

        this.masterGrp.traverse(child => child.userData["id"] = this.id)

        this.orbit.scale.multiplyScalar(this.dist)
        this.orbit.position.set(
            -base.x,
            -base.y,
            -base.z
        )

        if (this.texts) {
            const l = this.texts.length
            this.texts.forEach((txt) => {
                const i = txt.userData["idx"]
                txt.position.x = base.x + (this.radius) + (i / l)
                txt.position.y = (base.y - 3) + 15 * (i / l)
                txt.position.z = (base.z + this.dist - 5) + 3 * i
            })
        }

        if (this.infoSprite) {
            const side = this.orbit.scale.x > 0 ? -1 : 1
            const scale = this.radius/10
            this.infoSprite.scale.setScalar(scale)
            this.infoSprite.position.copy(base).x += (this.radius + scale) * side
        }

        this._satellites?.init()

        this.meshGrp.updateMatrixWorld()
        this.masterGrp.updateMatrixWorld()
        this.topGrp.updateMatrixWorld()
    }

    public update(world: World) {
        // // Update topGrp
        // if (this.parent) {
        //     this.parent.masterGrp.getWorldPosition(outWorldPos)
        //     this.topGrp.position.copy(outWorldPos)
        // }

        // Atmo direction
        const vec = (this.atmo?.material as THREE.ShaderMaterial).uniforms.viewVector.value
        this.atmo?.getWorldPosition(outWorldPos)
        vec.subVectors(world.cam.active.position.clone(), outWorldPos);

        // Axis Rotation
        const axisVal = (world.delta * this.angularRotVel) * Constants.ROT_SCALE;
        this.meshGrp.rotation.y -= axisVal;

        // Orbital Rotation
        if (Constants.CELESTIAL_ORB || this.isSatellite) {
            const orbVal = (world.delta * this.angularOrbVel) * Constants.ORB_SCALE;
            this.topGrp.rotation.y += orbVal;
        }

        this.masterGrp.getWorldPosition(Constants.__OUT_WORLD__POS)
        if (!this.isSatellite || this.texts) {
            world.cam.active.getWorldPosition(Constants.__OUT_CAM_POS)
            const dist = Constants.__OUT_WORLD__POS.distanceTo(Constants.__OUT_CAM_POS)

            if (!this.isSatellite) {
                // Sprite scaling
                this.markerSprite.scale.setScalar(dist / 50)

                // Distance visibility
                this.markerSprite.visible = dist > 5000 ? true : false
                this.meshGrp.visible = dist < 10000 ? true : false
            }

            if (this.texts)
                this.texts.map(t => t.visible = dist < 10000 ? true : false)
        }

        // Satellites Updates
        this._satellites?.update(world)

    }
}
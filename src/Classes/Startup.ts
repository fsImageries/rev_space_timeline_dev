import systemFactory from "../Factories/SystemFactory";
import Constants from "../helpers/Constants";
import { SystemData } from "../jsonInterfaces";
import { ProgressPanel } from "./ProgressPanel";
import { World } from "./World";

export class Startup {
    world: World

    constructor() {
        const progress = new ProgressPanel()

        progress.onclick = () => {
            progress.visible = false
            this.world.initGui()
            requestAnimationFrame((n) => World.eventLoop(n, this.world));
        }

        Constants.LOAD_MANAGER.onLoad = () => {
            progress.startBtnvisible = true
        }

        Constants.LOAD_MANAGER.onProgress = (url, itemsLoaded, itemsTotal) => {
            const val = (itemsLoaded / itemsTotal) * 100
            console.log(url, " ", val)
            progress.progress = val
        };
    }

    public async start(data: SystemData) {
        const sys = await systemFactory(data);
        this.world = new World(sys);
        sys.initWorld(this.world);

        // const obj = world.scene.getObjectByName("tangerineDream_masterGrp")
        const obj = this.world.scene.getObjectByName("yellowstone_masterGrp");
        // // const obj:any = null
        const target = sys.getById(obj.userData["id"]);
        // console.log(target)
        this.world.cam.setFollowTarget(target);
        this.world.cam.activateThird();
    }
}
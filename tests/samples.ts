import { Component } from "../src/ecs/Component";
import { System } from "../src/ecs/System";

export class RadiusComponent extends Component<{ real: number, draw: number }> { }

export class RotComponent extends Component<{ rot: number }> { }

export class RenderSystem extends System {
    static queries = [];
    execute(): void {
        // do something
    }
}

export class RadiusMultSystem extends System {
    static queries = [[{operand: "exist", value: RadiusComponent}]]
    execute(): void {
        // do something
    }
}

export class RotSystem extends System {
    static queries = [[{operand: "exist", value: RotComponent}]]
    execute(): void {
        // do something
    }
}

export class RotRadSystem extends System {
    // TODO write convienience function to build operand types
    static queries = [[{operand: "exist", value: RotComponent}, {operand: "exist", value: RadiusComponent}]]
    execute(): void {
        // do something
    }
}

export class RotAndRadSystem extends System {
    static queries = [[{operand: "exist", value: RotComponent}], [{operand: "exist", value: RadiusComponent}]]
    execute(): void {
        // do something
    }
}
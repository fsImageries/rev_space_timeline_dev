import { BaseDataComponent } from "../baseclasses/CommonComponents";
import { Component, IComponent, TComponent } from "./Component";
import { Entity } from "./Entity";
import { System } from "./System";
import { World } from "./World";


export type QueryElements = { entityQuery: ComponentQueryState[]; entities: Entity[] }[];
export type Query = { [systemID: string]: QueryElements };
export type ComponentQueryState = [string, boolean, boolean, string | null];

export interface QueryOperand {
    operand: string;
    value: TComponent;
    extra?: any
}

export const operand = (o: string, c: TComponent):QueryOperand => {return {operand: o, value: c}}

export class QueryManager {
    public sysQueries: Query;
    public compQueries:  Query;
    public world: World;

    constructor(world: World) {
        this.sysQueries = {}
        this.compQueries = {}
        this.world = world
    }

    private stateFromOperands(operands: QueryOperand[]): ComponentQueryState[] {
        const entityState: ComponentQueryState[] = []
        for (const operand of operands) {
            // State: [componentID, shouldExist, shouldSelf, nameValue]
            // TODO combine operands?
            switch (operand.operand) {
                case "exist": {
                    entityState.push([operand.value.typeID, true, false, null])
                    break
                };
                case "!exist": {
                    entityState.push([operand.value.typeID, false, false, null])
                    break
                };
                case "self": {
                    // if (self)
                    // entityState.push([self.typeID, true, false])
                    entityState.push([operand.value.typeID, true, true, null])
                    break
                };
                case "name": {
                    entityState.push([operand.value.typeID, true, false, operand.extra.name])
                    break
                };
            }
        }
        return entityState
    }

    private validateState(entity: Entity, state: ComponentQueryState[], compID?:string) {
        const ids = Object.keys(entity.components)
        const names:string[] = []
        const instanceIds = Object.values(entity.components).map(c => {
            if (c.constructor.name === BaseDataComponent.name) names.push(c.data.name)
            return c.instanceID
        })
        return state.every(query => {
            const [id, shouldExist, shouldSelf, name] = query
            // check if component should exist
            if (!shouldExist && ids.includes(id)) return false


            // Check if component should only be on same entity
            if (shouldSelf) {
                // check against compID
                return compID ? instanceIds.includes(compID) : false
            }

            if (name !== null) return names.includes(name)

            // check that component exists
            if (!ids.includes(id)) return false

            return true
        })
    }

    public getSystemQuery(sys: System) {
        const that = (sys.constructor as typeof System)
        const id = that.typeID
        if (!(id in this.sysQueries)) {
            this.sysQueries[id] = that.queries.map(opers => {
                return {
                    entityQuery: this.stateFromOperands(opers),
                    entities: []
                }
            })
        }
        return this.sysQueries[id];
    }

    public getComponentQuery(component:IComponent) {
        const that = (component.constructor as typeof Component)
        if (that.dependencies.length === 0) return
        const id = component.instanceID
        if (!(id in this.compQueries)) {
            this.compQueries[id] = that.dependencies.map(opers => {
                return {
                    entityQuery: this.stateFromOperands([opers]),
                    entities: []
                }
            })
        }
        return this.compQueries[id];
    }

    public queryComponentQueries() {
        for (const entity of this.world.ecManager.entities) {
            this.updateQueries(entity, this.compQueries, true)
        }
    }

    public updateQueries(entity: Entity, queries?:Query, comp = false) {
        if (!queries) queries = this.sysQueries
        // check if entity needs to be put into query
        for (const id in queries) {
            const query = queries[id];
            const compID = comp ? id : undefined
            for (const q of query) {
                if (!q.entities.includes(entity) && this.validateState(entity, q.entityQuery, compID)) q.entities.push(entity)
            }
        }
    }
}
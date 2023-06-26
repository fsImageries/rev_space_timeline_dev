import { Component, ComponentConstructor, ComponentSchema } from "./Component";
import { Entity } from "./Entity";
import { World } from "./World";

// type Query = { [systemID: string]: { componentIDs: string[]; entities: Entity[] } };
// export type QueryElements = { componentIDs: string[]; entities: Entity[] }[] ;
// export type Query = { [systemID: string]: QueryElements };

export class EntityComponentManager {
  // public queries: Query;
  public entities: Entity[];
  public world: World

  constructor(world:World) {
    // this.queries = {};
    this.entities = [];
    this.world = world
  }

  // /* eslint-disable @typescript-eslint/no-explicit-any*/
  // public getQuery(id: string, components: SystemQueries) {
  //   if (!(id in this.queries)) {
  //     this.queries[id] = components.map(comp => {
  //       return {
  //         componentIDs: comp.map((c) => c.typeID),
  //         entities: []
  //       }
  //     })
  //   }
  //   // pass the entity list to the querying component and fill it everytime a component is added
  //   return this.queries[id];
  // }

  public createEntity() {
    const entity = new Entity(this, crypto.randomUUID(), {});
    this.entities.push(entity);
    return entity;
  }

  public addEntityComponent<T extends ComponentSchema, C extends Component<T>>(
    entity: Entity | string,
    component: ComponentConstructor<T, C>,
    data: T
  ) {
    if (!component.typeID) component.typeID = crypto.randomUUID();
    const typeID = component.typeID;

    entity = typeof entity === "string" ? (this.entities.find((e) => e.id === entity) as Entity) : entity;
    if (typeID in entity.components) return this; // Component already exists

    const c = new component(data);
    entity.components[typeID] = c;

    this.world.queryManager.updateQuery(entity)
    return this;
  }

  public queryComponentDependencies() {
    this.entities.forEach(e => e.queryComponentDependencies())
  }

  public init() {
    this.entities.forEach(e => e.init())
  }

  public load() {
    this.queryComponentDependencies()
    this.init()
  }
}

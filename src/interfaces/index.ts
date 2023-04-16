import EnerstaticRelationship from "../EnvrionmentalNode/EnerstaticRelationship"
import EnvrionmentalNode from "../EnvrionmentalNode/EnvrionmentalNode"
import Structure from "../EnvrionmentalNode/Structure"
import EnerstaticNode from "../MinimalEnerstaticProgram/EnerstaticNode"

export interface NodeContainer {
    [key: number]: EnerstaticNode
}

export interface StructureContainer {
    [key: number]: Structure | EnvrionmentalNode
}
export interface RelationshipContainer {
    [key: number]: EnerstaticRelationship
}
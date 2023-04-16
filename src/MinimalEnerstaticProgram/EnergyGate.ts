import EnerstaticNode from "./EnerstaticNode";

export default class EnergyGate {
  parent: EnerstaticNode
  id: number;
  energyCurrent: number = 100;
  cost: number = 50;
	constructor(id: number, parent: EnerstaticNode){
    this.id = id;
  	this.parent = parent;
  }
  activate(){
  	if(this.parent.energyLevel > this.parent.energySetPoint){
    	this.parent.modifyEnergy(this.energyCurrent)
    }
    if(this.parent.energyLevel < this.parent.energySetPoint){
    	this.parent.modifyEnergy(this.energyCurrent);
    }
  }
}
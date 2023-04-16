import EnerstaticNode from "./EnerstaticNode";

export default class EnergyChannel {
  parent: EnerstaticNode
  target: EnerstaticNode
  id: number;
  energyCurrent: number = 5;
  cost: number = 10;
	constructor(id: number, parent: EnerstaticNode, target: EnerstaticNode){
    this.id = id;
  	this.parent = parent;
    this.target = target;
  }
  activate(){
    const isParentEnergyLow = this.parent.energyLevel < this.parent.energySetPoint;
    const isParentEnergyHigh = this.parent.energyLevel > this.parent.energySetPoint;

    const isTargetEnergyLow = this.target.energyLevel < this.target.energySetPoint;
    const isTargetEnergyHigh = this.target.energyLevel > this.target.energySetPoint;

    //TODO: Rough conservation of energy.
    //Nodes can be pushed into death and energy that does so is lost.
    
    if(this.parent.isDead || this.target.isDead) return; //Channel doesn't work if target/parent is dead.
    if(isParentEnergyLow){
      if(isTargetEnergyLow) return;
      const targetEnergyDifference = Math.abs(this.target.energySetPoint) - Math.abs(this.target.energyLevel);

      //Can't take more than another node has to give
      const energyTransferred = targetEnergyDifference > this.energyCurrent ? this.energyCurrent : targetEnergyDifference
      this.parent.modifyEnergy(energyTransferred); //Give energy to self
      this.target.modifyEnergy(-energyTransferred); //Take energy from target
    }
    
    const energyDifference = Math.abs(this.parent.energySetPoint) - Math.abs(this.parent.energyLevel);
    if(isParentEnergyHigh && (energyDifference > this.energyCurrent)){
      //Can't transfer more energy than I have to give.
      const energyTransferred = energyDifference > this.energyCurrent ? this.energyCurrent : energyDifference
      this.parent.modifyEnergy(-energyTransferred); //Take energy from self
      this.target.modifyEnergy(energyTransferred); //Give energy to target
    }
  }
}
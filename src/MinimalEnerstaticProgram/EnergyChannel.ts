import { emitTransfer } from "../events/energyTransfer";
import EnerstaticNode from "./EnerstaticNode";

export default class EnergyChannel {
  parent: EnerstaticNode
  target: EnerstaticNode
  id: number;
  energyCurrent: number = 50;
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

    if(this.parent.isDead || this.target.isDead) return;

   

    // this.greedyStrategy(isParentEnergyLow, isParentEnergyHigh);
    this.equalStrategy(isParentEnergyLow, isParentEnergyHigh, isTargetEnergyLow);


  }
  equalStrategy = (isParentEnergyLow: boolean, isParentEnergyHigh: boolean, isTargetEnergyLow: boolean)=>{
    // Case 1: Parent needs energy; take from target's excess (if any)
    if (isParentEnergyLow && !isTargetEnergyLow) {
      const targetExcess =
        Math.max(0, Math.abs(this.target.energyLevel) - Math.abs(this.target.energySetPoint));
      const amount = Math.min(this.energyCurrent, targetExcess);
      if (amount > 0) {
        this.parent.modifyEnergy(amount);
        this.target.modifyEnergy(-amount);
        // donor -> receiver (target -> parent)
        emitTransfer(this.target, this.parent, amount);
      }
    }

    // Case 2: Parent has excess; give to target if target can accept
    const parentExcess =
      Math.max(0, Math.abs(this.parent.energyLevel) - Math.abs(this.parent.energySetPoint));
    if (isParentEnergyHigh && parentExcess > 0) {
      const amount = Math.min(this.energyCurrent, parentExcess);
      if (amount > 0) {
        this.parent.modifyEnergy(-amount);
        this.target.modifyEnergy(amount);
        // donor -> receiver (parent -> target)
        emitTransfer(this.parent, this.target, amount);
      }
    }
  }
  greedyStrategy = (isParentEnergyLow: boolean, isParentEnergyHigh: boolean)=>{
    // Case 1: Parent needs energy, take as much energy as possible
     if (isParentEnergyLow) {
      const desiredEnergy = this.parent.energySetPoint - this.parent.energyLevel;
      const isEnergyAvailableInTarget = this.target.energyLevel > desiredEnergy
      const amount = isEnergyAvailableInTarget ? desiredEnergy : this.target.energyLevel;
      const channelLimitedAmount = Math.min(this.energyCurrent, amount);
      // const channelLimitedAmount = amount
      if (channelLimitedAmount > 0) {
        // console.log('[ENERGY CHANNEL] Transferring energy from target to parent', channelLimitedAmount);
        this.parent.modifyEnergy(channelLimitedAmount);
        this.target.modifyEnergy(-channelLimitedAmount);
        // donor -> receiver (target -> parent)
        emitTransfer(this.target, this.parent, channelLimitedAmount);
      }
      // else {
      //   console.log('[ENERGY CHANNEL] No energy to transfer from target to parent', channelLimitedAmount);
      // }
    }

    // Case 2: Parent has excess energy dump it to targets no matter what
    const parentExcess =
      Math.max(0, Math.abs(this.parent.energyLevel) - Math.abs(this.parent.energySetPoint));
    if (isParentEnergyHigh) {
      const channelLimitedAmount = Math.min(this.energyCurrent, parentExcess);
      // const channelLimitedAmount = parentExcess
      if (channelLimitedAmount > 0) {
        // console.log('[ENERGY CHANNEL] Transferring energy from parent to target', channelLimitedAmount);
        this.parent.modifyEnergy(-channelLimitedAmount);
        this.target.modifyEnergy(channelLimitedAmount);
        // donor -> receiver (parent -> target)
        emitTransfer(this.parent, this.target, channelLimitedAmount);
      }
      // else {
      //   console.log('[ENERGY CHANNEL] No energy to transfer from parent to target', channelLimitedAmount);
      // }
    }
}
}



// import { emitTransfer } from "../events/energyTransfer";
// import EnerstaticNode from "./EnerstaticNode";

// export default class EnergyChannel {
//   parent: EnerstaticNode
//   target: EnerstaticNode
//   id: number;
//   energyCurrent: number = 5;
//   cost: number = 10;
// 	constructor(id: number, parent: EnerstaticNode, target: EnerstaticNode){
//     this.id = id;
//   	this.parent = parent;
//     this.target = target;
//   }
//   activate(){
//     const isParentEnergyLow = this.parent.energyLevel < this.parent.energySetPoint;
//     const isParentEnergyHigh = this.parent.energyLevel > this.parent.energySetPoint;

//     const isTargetEnergyLow = this.target.energyLevel < this.target.energySetPoint;
//     const isTargetEnergyHigh = this.target.energyLevel > this.target.energySetPoint;

//     //TODO: Rough conservation of energy.
//     //Nodes can be pushed into death and energy that does so is lost.
    
//     if(this.parent.isDead || this.target.isDead) return; //Channel doesn't work if target/parent is dead.
//     if(isParentEnergyLow){
//       if(isTargetEnergyLow) return;
//       const targetEnergyDifference = Math.abs(this.target.energySetPoint) - Math.abs(this.target.energyLevel);

//       //Can't take more than another node has to give
//       const energyTransferred = targetEnergyDifference > this.energyCurrent ? this.energyCurrent : targetEnergyDifference
//       this.parent.modifyEnergy(energyTransferred); //Give energy to self
//       this.target.modifyEnergy(-energyTransferred); //Take energy from target
//       emitTransfer(this.parent, this.target, energyTransferred);
//     }
    
//     const energyDifference = Math.abs(this.parent.energySetPoint) - Math.abs(this.parent.energyLevel);
//     if(isParentEnergyHigh && (energyDifference > this.energyCurrent)){
//       //Can't transfer more energy than I have to give.
//       const energyTransferred = energyDifference > this.energyCurrent ? this.energyCurrent : energyDifference
//       this.parent.modifyEnergy(-energyTransferred); //Take energy from self
//       this.target.modifyEnergy(energyTransferred); //Give energy to target
//       emitTransfer(this.parent, this.target, energyTransferred);
//     }
//   }
// }
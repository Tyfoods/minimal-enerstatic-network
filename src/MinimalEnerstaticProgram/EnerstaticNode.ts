import getRndIntInc from '../functions/getRndIntInc';
import EnergyChannel from './EnergyChannel';
import EnergyGate from './EnergyGate';
import isObjEmpty from '../functions/isObjEmpty';
import MinimalEnerstaticProgram from './MinimalEnerstaticProgram';

interface numPropObj{
  [key:number]: Object
}

export default class EnerstaticNode {
  id: number;
  energySetPoint: number = 0;
  energyLevel:number = 0;
  energyThreshold:number = 10;
  isDead: Boolean = false;
  enerstaticNodes: {[key: number]: EnerstaticNode} = {}
  features: {
    [key:string]: numPropObj;
  } = {energyGates:{}, energyChannels:{}};

  threeObj: THREE.Mesh;
  connectionPoints: number[] = [];
  maxConnections: number = 4;

	constructor(id: number, programDetails: MinimalEnerstaticProgram){
    this.enerstaticNodes = programDetails.enerstaticNodes
    this.id = id;
  }
  dynamics(){
    this.dieIfEnergyLevelIsFatal();
    if(this.isDead) return;
    this.actionLoop();
    this.activateFeatures();
  }
  activateFeatures(){
    Object.values(this.features).forEach((featureType: numPropObj)=>{
      Object.values(featureType).forEach((feature: EnergyChannel | EnergyGate)=>{
        feature.activate();
      })
    })
  }
  actionLoop(){
  	//High sensitivity action loop..
  	if(this.energyLevel > this.energySetPoint){
    
    }
    if(this.energyLevel < this.energySetPoint){
      // console.log("Energy less than: ", this.energySetPoint);
    }
  }

  modifyEnergy(energy: number){this.energyLevel += energy;}
  generateUniqueIdForFeature(featureName: string){
    if(isObjEmpty(this.features) || isObjEmpty(this.features[`${featureName}s`])) return 0;
    const features = Object.values(this.features[`${featureName}s`]);
    const sortedFeatureIds = features.map((feature: any)=>{return feature.id})
    const maxId = Math.max(...sortedFeatureIds);
    return maxId+1;
  }
  buildFeature(featureName: string, config: any = {}){
  	if(featureName === 'energyGate'){
      const energyGateId = this.generateUniqueIdForFeature(featureName);
    	this.features.energyGates[energyGateId] = new EnergyGate(energyGateId, this);
    }
    if(featureName === 'energyChannel'){
      const energyChannelId = this.generateUniqueIdForFeature(featureName);
      const randomEnerstaticNode: EnerstaticNode = config.node ? config.node : this.getRandomEnerstaticNode();
      this.features.energyChannels[energyChannelId] = new EnergyChannel(energyChannelId, this, randomEnerstaticNode);
      //TODO: Probably connections can be handled better
      const {x: oX, y: oY, z: Oz} = this.threeObj.position;
      const {x: tX, y: tY, z: tz} = randomEnerstaticNode.threeObj.position;
      this.connectionPoints.push(...[oX, oY, Oz, tX, tY, tz]);
    }
  }
  getConnectionPoints(){
    //TODO: Implement null connnection points for freespots.
    //Add null projection points for each freespot.
    // let nullPoints: any[] = []
    // let numberOfFreeProjections = this.maxProjections - this.projections.length
    // for(let i=0; i<numberOfFreeProjections; i+=1){
    //     nullPoints.push(null, null, null, null, null, null)
    // }
    // return this.allProjectionPoints.concat(nullPoints);
    return this.connectionPoints
  }
  getRandomEnerstaticNode(): EnerstaticNode{
    const enerstaticNodes = Object.values(this.enerstaticNodes);
    const rndIndex = getRndIntInc(0,enerstaticNodes.length-1);
    const rndNodeId = this.enerstaticNodes[rndIndex].id;
    //Don't allow for sending energy to self
    if(rndNodeId === this.id) return this.getRandomEnerstaticNode()
    else return this.enerstaticNodes[rndIndex];
  }
  makeRandomEnergyChannelConnections(){
    for(let i=0; i<this.maxConnections;i+=1){
      this.buildFeature('energyChannel');
    }
  }
  live(){
    //Makes as many as max connections
    this.makeRandomEnergyChannelConnections();
    // this.buildFeature('energyGate');
  	this.energyLevel = this.energySetPoint;
    this.isDead = false
    // console.log(`Node ${id} has come alive`);
  }
  dieIfEnergyLevelIsFatal(){
    const isEnergyLevelFatal = Math.abs(this.energyLevel) > this.energyThreshold
  	if(isEnergyLevelFatal) this.isDead = true;
  }
}
import EnerstaticNode from './EnerstaticNode';
import returnTrueWithProbability from '../functions/returnTrueWithProbability';
import { NodeContainer } from '../interfaces';

export default class MinimalEnerstaticProgram {

    nTrials: number = 1000;
    enerstaticNodes: NodeContainer = {}
    livingNodes: number = 0;
    isDead: Boolean = false;

    constructor(nodesToGenerate: number){
      this.generateEnerstaticNodes(nodesToGenerate)
    }

    generateEnerstaticNodes(numberOfNodes: number){
      console.log("Generating enersatic nodes");
      this.livingNodes = numberOfNodes;
      for (let counter = 0; counter < numberOfNodes; counter+=1){
        this.enerstaticNodes[counter] = new EnerstaticNode(counter, this);
      }
    }

    startEnerstaticNodes(){
        Object.values(this.enerstaticNodes)
        .forEach((node: EnerstaticNode)=>{node.live();})
    }

    perturbEvenNodesInNetwork = (perturbationStrength: number, positivePerturbation: Boolean)=>{
        // console.log(`Perturbing even nodes in network with ${positivePerturbation ? "+" : "-"}${perturbationStrength} strength`);
        //Perturbation Probability - Probabilty of any given node being perturbed
        let perturbationCount = 0;
        Object.values(this.enerstaticNodes).forEach((node: EnerstaticNode)=>{
            if(node.isDead) return;
            if(node.id % 2){
                perturbationCount+=1;
                if(positivePerturbation) node.energyLevel += perturbationStrength
                else node.energyLevel -= perturbationStrength
            }
        });
        // console.log(`${perturbationCount} nodes perturbed`);
    }

    perturbNetwork = (perturbationProbability: number, perturbationStrength: number, positivePerturbation: Boolean)=>{
        // console.log(`Perturbing approx ${perturbationProbability} of nodes, with ${positivePerturbation ? "+" : "-"}${perturbationStrength} strength`);
        //Perturbation Probability - Probabilty of any given node being perturbed
        let perturbationCount = 0;
        Object.values(this.enerstaticNodes).forEach((node: EnerstaticNode)=>{
            if(node.isDead) return;
            if(returnTrueWithProbability(perturbationProbability)){
                perturbationCount+=1;
                if(positivePerturbation) node.energyLevel += perturbationStrength
                else node.energyLevel -= perturbationStrength
            }
        });
        // console.log(`${perturbationCount} nodes perturbed`);
    }

    calculateNumberOfLivingNodes = ()=>{
        let livingNodes = 0;
        Object.values(this.enerstaticNodes).forEach((node: EnerstaticNode)=>{
            if(node.isDead) return;
            else livingNodes+=1;
        });
        this.livingNodes = livingNodes;
        return livingNodes
    }
    
    perturbationPattern(){
        Object.values(this.enerstaticNodes).forEach((node: EnerstaticNode)=>{
            if(node.isDead) return;
            if(returnTrueWithProbability(1)){
                const perturbationStrength = 50;
                const perturbation = returnTrueWithProbability(50) ? -perturbationStrength : perturbationStrength;
                node.energyLevel +=perturbation
            }
        });
    }
    
    readOutEnergies(){
      const nodes = Object.values(this.enerstaticNodes).map((node: EnerstaticNode)=>{
        return node.energyLevel;
      })
      console.log("Node Energies: ", nodes);
    }

    stepEnerstaticNodes = ()=>{
        let livingNodes = 0;
        Object.values(this.enerstaticNodes).forEach((node: EnerstaticNode)=>{
            if(node.isDead) return;
            else{
                node.dynamics();
                livingNodes+=1;
            }
        })
        this.livingNodes = livingNodes;
        return livingNodes
    }

    stepEnerstaticProgram = ()=>{
        // this.perturbationPattern();
        this.stepEnerstaticNodes();
        // this.readOutEnergies();
    }
    
    runEnerstaticProgramForNTrials(nTrials: number){
      for (let timeStep=0; timeStep<nTrials; timeStep+=1){
        this.readOutEnergies();
        this.perturbationPattern();
      }
      this.readOutEnergies();
    }
  }
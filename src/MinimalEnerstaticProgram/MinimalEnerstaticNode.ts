const isDivisibleBy = (i: number)=>{if(i%10) return true};
const timeStepToStopPerturbations = 500;
const energySetPoint = 0;
const energyConstant = 100;
const perturbationStrength = 10;
const nTrails = 1000;
const effectorCost = 10;
const effectorCount = 1;
export default function enerstaticNode(){
	//Energy set point defined by the "control center"
	let energyLevel = energySetPoint;
	for (let timeStep=0; timeStep<nTrails; timeStep+=1){
  		console.log(`Energy at Trial ${timeStep}:`, energyLevel);
	    if( isDivisibleBy(timeStep) && timeStep < timeStepToStopPerturbations ){
      	//Perturbation "sensed" via causal effect on "action decision"
	      energyLevel-=perturbationStrength;
	    }
      //Action decision rules I.E.
      //Whether the "effector" exhibits causal power or not
	    if(energyLevel > energySetPoint){
      	energyLevel-=energyConstant * effectorCount; //"Effector" action
        continue;
      }
	    if(energyLevel < energySetPoint){
      	energyLevel+=energyConstant * effectorCount;//"Effector" action
        continue;
      }
	  }
  if(energyLevel === 0) console.log("Enerstasis Reached"); //Lived
  else console.log("Failed to reach enerstasis."); //Died
}
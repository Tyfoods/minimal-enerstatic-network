import { NodeContainer } from './../interfaces/index';
import returnTrueWithProbability from '../functions/returnTrueWithProbability';
import MinimalEnerstaticProgram from './MinimalEnerstaticProgram';
import Visualizer from './Visualizer';

//Passing in the number of nodes to generate
const enerstaticProgram = new MinimalEnerstaticProgram(100);
const nodes: NodeContainer = enerstaticProgram.enerstaticNodes;
const visual = new Visualizer(nodes);

//Node starts off "alive" with features already loaded up.
//Nodes make connections when turned on.
enerstaticProgram.startEnerstaticNodes();
visual.renderNodeConnections();
visual.createNodeHealthLegend_2();

//Starting Program
const animationLoop = (visual: Visualizer)=>{
  const {scene, camera, renderer, clock} = visual

  function renderFrame(){
    renderer.render( scene, camera)
    requestAnimationFrame( renderFrame );

    //PROGRAM LOOP
    if(enerstaticProgram.livingNodes){
      enerstaticProgram.stepEnerstaticProgram();
      visual.animateNodeHealth();
    }
    else{
      visual.animateNodeHealth();
      throw new Error("All nodes died");
    }
    //PROGRAM LOOP END
  }

  setInterval(()=>{
    const isPositivePerturbation = returnTrueWithProbability(45);
    // const perturbStr = 10;
    // const perturbProb = 20;
    if(isPositivePerturbation) enerstaticProgram.perturbNetwork(5, .05, true);
    else enerstaticProgram.perturbNetwork(2.5, .01, false);
    // enerstaticProgram.perturbNetwork(10, 1, false);
  }, 100)

  renderFrame()
}
export default ()=>animationLoop(visual);


import * as THREE from 'three';
import EnerstaticNode from './EnerstaticNode';
import { NodeContainer } from '../interfaces'
import makeEvenlySpacedArr from '../functions/makeEvenlySpacedAr';
import mapValueToNewRange from '../functions/mapValueToNewRange';
import blendColors from '../functions/blendColors';
import * as TWEEN from '@tweenjs/tween.js';
import EnergyChannel from './EnergyChannel';
import moveNullValuesToEndOfArray from '../functions/moveNullValuesToEndOfArray';
import createScalesArray from '../artistFunctions/createScalesArray';
import createOpacityArray from '../artistFunctions/createOpacityArray';
import transferToArrayBuffer from '../artistFunctions/transferToArrayBuffer';
import { nodeEndColor, nodeStartColor } from './Constants';
import convertStringToHex from '../functions/convertStringToHex';
import onWindowResize from '../artistFunctions/onWindowResize';

export default class Visualizer {

    origin: {[key:string]: number}
    axis: string
    verticalAxis: string
    enerstaticNodes: NodeContainer = {};
    visualFuncs: {}[] = [];
    verticalSpacing: number = 60;
    horizontalSpacing: number = 10;
    horizontalPositions: number[] = [];
    verticalPositions: number[] = [];

    //ThreeJs Stuff
    scene: THREE.Scene;
    camera: any;
    renderer: THREE.WebGLRenderer;
    clock: THREE.Clock;

    private connectionGeom: any;
    private connectionMesh: any;

    constructor(enerstaticNodes: NodeContainer){
        //Grid parameters
        // this.origin = {x: 50, y: 75, z: 0};
        this.enerstaticNodes = enerstaticNodes;
        this.origin = {x: 0, y: 0, z: 0};
        this.axis = 'z';
        this.verticalAxis = 'y';
        this.setUpThreeJsTools();
        // this.startAnimationLoop();

        // this.createTestLineOnScreen();
        this.initializeEnerstaticNodesInScene2D(enerstaticNodes);
    }

    //Expensive version that visualizes every color along the gradient explicitly.
    createNodeHealthLegend_2 = ()=>{
        const leftMostColumn = this.horizontalPositions.sort((a,b)=>a-b)[0]
        var range = 70;
        const verticalValues = makeEvenlySpacedArr(range, -range, 100);
        let i=0;
        verticalValues.forEach((verticalValue)=>{
            const color = blendColors(nodeStartColor, nodeEndColor, i);
            const hexColor = convertStringToHex(color);
            var geometry = new THREE.BoxGeometry(10,1,1);
            var material = new THREE.MeshBasicMaterial({wireframe: false, color: hexColor})
            var mesh = new THREE.Mesh(geometry, material);
            mesh.position.x = leftMostColumn - 50;
            mesh.position.y = verticalValue;
            this.scene.add(mesh);
            i+=.01;
        })
    }
    setUpThreeJsTools(){
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );
        this.renderer = renderer;
        
        const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
        camera.position.set( 0, 0, 200 );
        camera.lookAt( 0, 0, 0 );
        this.camera = camera;

        const scene = new THREE.Scene();
        this.scene = scene;

        const clock = new THREE.Clock();
        this.clock = clock;

        onWindowResize(camera, renderer);
    }
    createNodeHealthLegend = ()=>{
        const leftMostColumn = this.horizontalPositions.sort((a,b)=>a-b)[0]
        //https://stackoverflow.com/questions/44411012/three-color-unknown-color-002dff-warning-error
        var geometry = new THREE.BoxGeometry(10,50,1);
        
        var hexStartColor = parseInt ( nodeStartColor.replace("#","0x"), 16 );
        var hexEndColor = parseInt ( nodeEndColor.replace("#","0x"), 16 );

        var material = new THREE.ShaderMaterial({
        wireframe: false,
        uniforms: {
            color1: {
            value: new THREE.Color(hexStartColor)
            },
            color2: {
            value: new THREE.Color(hexEndColor)
            }
        },
        vertexShader: `
            varying vec2 vUv;

            void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 color1;
            uniform vec3 color2;
        
            varying vec2 vUv;
            
            void main() {
            
            gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
            }
        `,
        });
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = leftMostColumn - 50;
        this.scene.add(mesh);
    }
    createTestLineOnScreen(){
        //create a blue LineBasicMaterial
        const material = new THREE.LineBasicMaterial( { color: 0x0000ff } );

        const points = [];
        points.push( new THREE.Vector3( - 10, 0, 0 ) );
        points.push( new THREE.Vector3( 0, 10, 0 ) );
        points.push( new THREE.Vector3( 10, 0, 0 ) );

        const geometry = new THREE.BufferGeometry().setFromPoints( points );

        const line = new THREE.Line( geometry, material );

        this.scene.add( line );
        this.renderer.render( this.scene, this.camera );
    }
    initializeEnerstaticNodesInScene2D(enerstaticNodes: NodeContainer){
        let nodes: EnerstaticNode[] = Object.values(enerstaticNodes);
        let numberOfNodes = nodes.length;
        // let numberOfNodes = 30

        //This allows us to make the bits evenly spaced horizontally
        //This is each bit's x position, or displacement from the origin
        const HORIZONTAL_SPACING = this.horizontalSpacing;
        let maximumBitsPerRow = (numberOfNodes > 10 ? 10 : numberOfNodes);
        var range = (maximumBitsPerRow - 1) * HORIZONTAL_SPACING;
        var horizontalCoordsArray = makeEvenlySpacedArr(range, -range, maximumBitsPerRow);
        this.horizontalPositions = horizontalCoordsArray;
        // console.log("Horizontal Coords Array: ", horizontalCoordsArray);

        //This allows us to make the bits evenly spaced vertically
        //This is each row's y position, or displacement from the origin
        var cardinality = Math.ceil( numberOfNodes/10 )
        const VERTICAL_SPACING = this.verticalSpacing;
        var verticalCordsArray = makeEvenlySpacedArr(VERTICAL_SPACING, -VERTICAL_SPACING, cardinality);
        this.verticalPositions = verticalCordsArray;


        // console.log("Creating and adding nodes to create");
        const nodeIds: number[] = nodes.map((node: EnerstaticNode)=>{return node.id});
        let counter = 0;
        verticalCordsArray.forEach((yPosition: number)=>{
            horizontalCoordsArray.forEach((xPosition: number)=>{
                const material = new THREE.MeshBasicMaterial({ color: convertStringToHex(nodeStartColor) });
                material.needsUpdate = true;
    
                var geometry = new THREE.BoxGeometry( 10, 10, 1 );
                var box = new THREE.Mesh( geometry, material );
                
                box.position.y = this.origin.y + yPosition;
                box.position.x = this.origin.x + xPosition;
                //Transparent to allow for dynamic opacity changes.
                box.material.transparent = true;
                box.material.opacity = 1; 

                this.scene.add(box);

                //Giving each node a threejs obj representation
                this.enerstaticNodes[nodeIds[counter]].threeObj = box;
                counter++;
            })
        })
    }
    animateNodeHealth=()=>{
        Object.values(this.enerstaticNodes).forEach((node: EnerstaticNode)=>{
            if(node.energyLevel === 0) return; //No Change
            //@ts-ignore
            if(node.isDead) return node.threeObj.material.opacity = 0;
            const percentage = mapValueToNewRange(Math.abs(node.energyLevel), [0, node.energyThreshold], [1,0]);

            // console.log("Current Energy Level: ", Math.abs(node.energyLevel));
            // console.log(`Energy Range: 0-${node.energyThreshold}`);
            // console.log("Percentage: ", percentage);

            //Animate with home made blendColor algorithm and ThreeJs
            // Finding a color that is some percentage away from the start color
            // towards the end color according to node "health"
            //@ts-ignore
            let startColor = node.threeObj.material.color.getHexString();
            let endColor = blendColors(`0x${startColor}`, nodeEndColor, percentage);
            //@ts-ignore
            node.threeObj.material.color.setHex(endColor);

            //Nodes dying from low energy will have their opacity fade out.
            //@ts-ignore
            if(node.energyLevel===0 || node.energyLevel>0) node.threeObj.material.opacity = 1;
            //@ts-ignore
            else if(node.energyLevel<0) node.threeObj.material.opacity = percentage;

            //Animation with Tween
            // var tween = new TWEEN.Tween(startColor);
            // tween.to(1, {
            //     r: value.r,
            //     g: value.g,
            //     b: value.b,
            //   })
            //   .onUpdate(function () {
            //     node.threeObj.material.color.setHex(node.threeObj.material.color);
            //     target.material.color = initial;
            //   }
            // Then tell the tween we want to animate the x property over 1000 milliseconds
            // tween.to({x: 200}, 1000)

        })
    }
    //TODO: Finish connection rendering system
    getConnectionDataFromAllNodes(){
        let nodePointData: any = [];
        Object.values(this.enerstaticNodes).forEach((node: EnerstaticNode)=>{
            nodePointData = nodePointData.concat(node.getConnectionPoints())
        });

        return moveNullValuesToEndOfArray(nodePointData)
    }
    renderNodeConnections = ()=>{
        let {numberOfPointsToRender, array: allAxonPoints} = this.getConnectionDataFromAllNodes();
        let positions = this.createTypedPointArray(allAxonPoints);
        let connectionMesh = this.createConnectionMesh(positions, numberOfPointsToRender);
        this.scene.add(connectionMesh);
        this.setConnectionMesh(connectionMesh);
    }
    private setConnectionMesh(connectionMesh: any){
        this.connectionMesh = connectionMesh;
    }
    createTypedPointArray(allPoints: number[]){
        let maxNumberOfConnectionVertices = this.getMaxNumberOfConnectionVertices();
        // console.log("maxNumberOfProjectionVertices: ", maxNumberOfProjectionVertices)
        // console.log("All Axon Points Length: ", allAxonPoints.length)
        var vertices = new Float32Array(maxNumberOfConnectionVertices);
        // console.log("Initial Axon Points: ", allAxonPoints)
        vertices.set(allPoints);
        return vertices;
    }
    getMaxNumberOfConnectionVertices(){
        let  globalMaximumNumberOfConnections=0
        let nodes: EnerstaticNode[] = Object.values(this.enerstaticNodes)
        nodes.forEach((node: EnerstaticNode)=>{
            // console.log("neuronObject.maxProjections: ", neuronObject.maxProjections)
            globalMaximumNumberOfConnections += node.maxConnections
          
        });
        return globalMaximumNumberOfConnections*6
    }
    createConnectionMesh(positions: Float32Array, numberOfPointsToRender: number){

        let scalesArray = createScalesArray(positions.length/3);
        let opacityArray = createOpacityArray(positions.length/3);

        let opacities = new Float32Array(opacityArray.length);
        let scales = new Float32Array(scalesArray.length);

        transferToArrayBuffer(opacityArray, opacities);
        transferToArrayBuffer(scalesArray, scales);

        // console.log("Positions: ", positions);
        // console.log("Scales: ", scales);

        // let opacityMultiplier = {
        //     type: 'f',
        //     value: 1.0
        // }
        let uniform =  {
            color: { value: new THREE.Color( 0x501885 ) },
            // color: { value: new THREE.Color( 0xffffff ) },
            // opacity
            opacityMultiplier: {
                // type: 'f',
                value: 1.0
            } 
        };
        //TODO: Something is causing a bad bug that causes a projection to appear as if it's pointing to the origin.

        //@ts-ignore
        this.connectionGeom = new THREE.BufferGeometry().setFromPoints(positions)

        //Number of points to render is very interesting.
        //If you specify 2 points, then it will grab the first 6 vertices
        //Therefore it really is talking about points, not about vertices.

        this.connectionGeom.setDrawRange( 0, numberOfPointsToRender);
        this.connectionGeom.setAttribute( 'position', new THREE.BufferAttribute(positions, 3) );
        this.connectionGeom.setAttribute( 'scale', new THREE.BufferAttribute( scales, 1 ) );

        //TODO: These were causing weird errors with respect to buffer.
        //@ts-ignore
        // this.connectionGeom.setAttribute( 'opacityAttr', new THREE.BufferAttribute(opacities, 1) );
        // this.connectionGeom.setAttribute( 'opacityMultiplier', new THREE.BufferAttribute(uniform.opacityMultiplier, 1) );

        // this.connectionGeom.computeBoundingSphere();
        // this.connectionGeom.computeBoundingBox()

        //For cool looking lines
        // let shaderMaterial = new THREE.ShaderMaterial( {
        //     uniforms:       uniform,
        //     vertexShader:   document.getElementById('vertexshader-axon').textContent,
        //     fragmentShader: document.getElementById('fragmentshader-axon').textContent,
        //     // opacity: .5
        //     //@ts-ignore
        //     blending:       THREE.AdditiveBlending,
        //     // depthTest:      false,
        //     transparent:    true
        // });

        //@ts-ignore
        var axonMaterial = new THREE.LineBasicMaterial({
            linewidth: 2,
            //@ts-ignore
            // color: Colors.neuronColor,
            // color: 0x501885,
            color: 0xFFFFFF,
            //Dark Mode
            //@ts-ignore
            // blending: THREE.SubtractiveBlending, 
            //PurpleWhite-Uglyish
            // blending: THREE.AdditiveBlending,
            //Dark Mode
            // blending: THREE.MultiplyBlending,
            blending: THREE.NormalBlending,
            transparent: true
        });

        //Below has a "bug" with 2D vertexes. (Some axon's are 2D, because they have a 0 Z dimension)
        //See - https://github.com/mrdoob/three.js/issues/6288 
        this.connectionGeom.computeBoundingSphere();
        this.connectionGeom.computeBoundingBox();
        //@ts-ignore
        //TODO: Three args for Line is deprecated perhaps?
        return new THREE.LineSegments(this.connectionGeom, axonMaterial);
    }
    createThreeLineFromPoints=(coords1: number[], coords2: number[])=>{
        let points = []
    
        points.push(new THREE.Vector3(coords1[0], coords1[1], coords1[2]));
        points.push(new THREE.Vector3(coords2[0], coords2[1], coords2[2]));
    
    
        var material = new THREE.LineBasicMaterial( { color: 0x501885 } );
        var geometry = new THREE.BufferGeometry().setFromPoints( points );
        var connection = new THREE.Line( geometry, material );

        return connection;
    }
    setVisualizerFunctions(visualFuncs: {}[]){
        this.visualFuncs = visualFuncs
        console.log("Visual Funcs set to: ", visualFuncs)
    }
}

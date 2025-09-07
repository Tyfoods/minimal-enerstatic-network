import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { attachTouchControls } from '../../threeJsNNVisualizer/src/utils/touchControls';
import MinimalEnerstaticProgram from './MinimalEnerstaticProgram/MinimalEnerstaticProgram';
import Visualizer from './MinimalEnerstaticProgram/Visualizer';
import returnTrueWithProbability from './functions/returnTrueWithProbability';
import { clearTransferListener } from './events/energyTransfer';
import getRndIntInc from './functions/getRndIntInc';



export function init(container: HTMLElement) {
  console.log('[INIT] Starting init')
  let stopped = false;
  let animationId: number | null = null;
  let perturbTimer: number | null = null;
  let controls: PointerLockControls | null = null;
  let detachTouch: (() => void) | null = null;
  let keyboard: any;
  console.log('[INIT] Variables reset')

  const enerstaticProgram = new MinimalEnerstaticProgram(100);
  const nodes = enerstaticProgram.enerstaticNodes;
  const visual = new Visualizer(nodes);

  console.log('[INIT] Enerstatic program created')

  enerstaticProgram.startEnerstaticNodes();
  visual.renderNodeConnections();
  visual.createNodeHealthLegend_2();

  console.log('[INIT] Nodes created')

  const canvas = visual.renderer.domElement;
  if (canvas.parentElement) canvas.parentElement.removeChild(canvas);
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);

  const sizeToContainer = () => {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || Math.max(500, Math.floor(w * 0.6));
    visual.camera.aspect = w / h;
    // @ts-ignore
    visual.camera.updateProjectionMatrix?.();
    visual.renderer.setSize(w, h, false);
  };
  sizeToContainer();
  const resizeHandler = () => requestAnimationFrame(sizeToContainer);
  window.addEventListener('resize', resizeHandler);

  controls = new PointerLockControls(visual.camera as any, canvas);
  // Ensure THREEx.KeyboardState exists (shim)
  const w = window as any;
  if (!w.THREEx?.KeyboardState) {
    w.THREEx = w.THREEx || {};
    w.THREEx.KeyboardState = class {
      private keysPressed: Set<string> = new Set();
      constructor() {
        window.addEventListener('keydown', (e) => this.keysPressed.add(e.key.toUpperCase()));
        window.addEventListener('keyup',   (e) => this.keysPressed.delete(e.key.toUpperCase()));
      }
      pressed(key: string) { return this.keysPressed.has(key.toUpperCase()); }
      destroy() { this.keysPressed.clear(); }
    };
  }
  keyboard = new (window as any).THREEx.KeyboardState();

  const detach = attachTouchControls(canvas, visual.camera as any, {
    panScale: 0.25,
    zoomScale: 0.15,
    rotationScale: 0.004
  });
  detachTouch = detach;

  const toggleMouseFromCamera = (e: KeyboardEvent) => {
    if (e.key === ' ') {
      e.preventDefault();
      if (controls?.isLocked) controls.unlock();
      else if (canvas.isConnected && 'requestPointerLock' in canvas) controls?.lock();
    }
  };
  window.addEventListener('keydown', toggleMouseFromCamera, false);

  const clock = new THREE.Clock();
  console.log('[INIT] Clock created')

  let frameCount = 0;
  const animate = () => {
    if (stopped) {
        console.log('[ANIMATE] Stopped')
        return;
    }
    animationId = requestAnimationFrame(animate);
    if(frameCount < 5){
        console.log('[ANIMATE] Frame count', frameCount)
        frameCount++;
    }

    const delta = clock.getDelta();
    const move = 75 * delta;
    if (keyboard?.pressed?.('W')) (visual.camera as any).translateZ(-move);
    if (keyboard?.pressed?.('S')) (visual.camera as any).translateZ( move);
    if (keyboard?.pressed?.('A')) (visual.camera as any).translateX(-move);
    if (keyboard?.pressed?.('D')) (visual.camera as any).translateX( move);

    if (enerstaticProgram.livingNodes) {
      enerstaticProgram.stepEnerstaticProgram();
      visual.animateNodeHealth(delta);
    } else {
      visual.animateNodeHealth(delta);
    }

    visual.renderer.render(visual.scene, visual.camera);
  };
  console.log('[INIT] Animating')
  animate();
  console.log('[INIT] Animation loop started')


  perturbTimer = window.setInterval(() => {
    const isPositivePerturbation = returnTrueWithProbability(45);
    if (isPositivePerturbation) enerstaticProgram.perturbNetwork(50, Math.random() * 0.05, true);
    else enerstaticProgram.perturbNetwork(25, Math.random() * 0.05, false);
    // if (isPositivePerturbation) enerstaticProgram.perturbNetwork(2, 0.5, true);
    // else enerstaticProgram.perturbNetwork(5, 0.5, false);
  }, 100);

  console.log('[INIT] Init complete - Perturb timer started')

  const cleanup = () => {
    console.log('[CLEANUP] Starting cleanup, stopped at, ', stopped)
    if (stopped) return;
    stopped = true;

    if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
    if (perturbTimer) { clearInterval(perturbTimer); perturbTimer = null; }
    window.removeEventListener('resize', resizeHandler);
    window.removeEventListener('keydown', toggleMouseFromCamera);
    clearTransferListener();

    try {
      if (controls?.isLocked) controls.unlock();
      controls?.dispose();
      controls = null;
      detachTouch?.();
      detachTouch = null;
      try { (keyboard?.destroy?.()); } catch {}
      keyboard = null;

      if (canvas && canvas.parentElement === container) container.removeChild(canvas);

      const scene = visual.scene as THREE.Scene;
      scene.traverse((obj: any) => {
        obj.geometry?.dispose?.();
        if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m?.dispose?.());
        else obj.material?.dispose?.();
      });
      visual.renderer.dispose();
    } catch {}
  };

  return {
    scene: visual.scene,
    camera: visual.camera,
    renderer: visual.renderer,
    animate,
    cleanup
  };
}

export function cleanup() {}
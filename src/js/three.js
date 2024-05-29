import * as T from 'three';
// eslint-disable-next-line import/no-unresolved
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import fragment from '../shaders/fragment.glsl';
import vertex from '../shaders/vertex.glsl';

const device = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: window.devicePixelRatio
};

export default class Three {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new T.Scene();

    this.camera = new T.PerspectiveCamera(
      75,
      device.width / device.height,
      0.1,
      100
    );
    this.camera.position.set(0, 0, 35);
    this.scene.add(this.camera);

    this.renderer = new T.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true
    });
    this.renderer.setSize(device.width, device.height);
    this.renderer.setPixelRatio(Math.min(device.pixelRatio, 2));

    // this.controls = new OrbitControls(this.camera, this.canvas);

    this.clock = new T.Clock();
    this.previousTime = 0;
    this.zoomReducer = 0;
    this.model;
    this.modelRotation = 0;
    this.modelRotationIncrement = 0;
    this.prevScroll = 0;

    this.setLights();
    this.setGeometry();
    this.render();
    this.setResize();
  }

  setLights() {
    this.ambientLight = new T.AmbientLight(new T.Color(1, 1, 1, 1));
    this.scene.add(this.ambientLight);
    this.directionalLight = new T.DirectionalLight(0xffffff, 1);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.set(1024, 1024);
    this.directionalLight.shadow.camera.far = 15;
    this.directionalLight.shadow.camera.left = - 7;
    this.directionalLight.shadow.camera.top = 7;
    this.directionalLight.shadow.camera.right = 7;
    this.directionalLight.shadow.camera.bottom = - 7;
    this.directionalLight.position.set(- 5, 5, 0);
    this.scene.add(this.directionalLight);
  }

  setGeometry() {
    // this.planeGeometry = new T.PlaneGeometry(1, 1, 128, 128);
    // this.planeMaterial = new T.ShaderMaterial({
    //   side: T.DoubleSide,
    //   wireframe: true,
    //   fragmentShader: fragment,
    //   vertexShader: vertex,
    //   uniforms: {
    //     progress: { type: 'f', value: 0 }
    //   }
    // });

    // this.planeMesh = new T.Mesh(this.planeGeometry, this.planeMaterial);
    // this.scene.add(this.planeMesh);
    const gltfLoader = new GLTFLoader()

    gltfLoader.load(
      'https://alireza4791.github.io/farzad-daliri-logo/models/logo/fd-logo.gltf',
      (gltf) => {
        var Material = new T.MeshStandardMaterial({ color: 0xbcbcbc, roughness: 0.2, metalness: 0.1 });
        this.model = gltf.scene;
        this.model.traverse((child, i) => {
          if (child.isMesh) {
            child.material = Material;
            child.material.side = T.DoubleSide;
          }
        });
        this.scene.add(this.model);
      }
    )
  }

  render() {
    const elapsedTime = this.clock.getElapsedTime();
    const deltaTime = elapsedTime - this.previousTime;
    this.previousTime = elapsedTime;
    if (this.zoomReducer < 30) {
      this.zoomReducer = Math.min(this.zoomReducer + deltaTime * 75, 30);
      this.camera.position.set(0, 0, 35 - this.zoomReducer);
    }
    // if (scrollY != this.prevScroll) {
    //   this.modelRotation = this.modelRotation + deltaTime * 12;
    // } else {
    //   this.modelRotation = this.modelRotation + deltaTime;
    // }
    this.modelRotationIncrement = Math.min(deltaTime + Math.abs(scrollY - this.prevScroll) / 100, 0.1);
    this.modelRotation = this.modelRotation + this.modelRotationIncrement;
    if (this.model) {
      this.model.rotation.y = this.modelRotation;
    }
    console.log(this.modelRotationIncrement);
    this.prevScroll = scrollY;


    // this.planeMesh.rotation.x = 0.2 * elapsedTime;
    // this.planeMesh.rotation.y = 0.1 * elapsedTime;

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  }

  setResize() {
    window.addEventListener('resize', this.onResize.bind(this));
  }

  onResize() {
    device.width = window.innerWidth;
    device.height = window.innerHeight;

    this.camera.aspect = device.width / device.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(device.width, device.height);
    this.renderer.setPixelRatio(Math.min(device.pixelRatio, 2));
  }
}
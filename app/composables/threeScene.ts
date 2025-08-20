import * as THREE from 'three';
import { EffectComposer, RenderPass, FXAAEffect, EffectPass } from 'postprocessing';
import { N8AOPostPass } from 'n8ao';
import type { FPackage } from '~/composables/FPackage';
import type { FBlock } from '~/composables/FBlock';
import { CSS2DRenderer, OrbitControls } from 'three/examples/jsm/Addons.js';

export class F3DModel {
    private _model: THREE.Group;

    constructor(model: THREE.Group = new THREE.Group()) {
        this._model = model;
    }

    get model() { return this._model; }
}

export class ThreeScene {
    private static Instance: ThreeScene|null;
    public static get Current() {
        return ThreeScene.Instance;
    }

    private _canvas: HTMLCanvasElement;
    private three_scene: THREE.Scene;
    private three_camera: THREE.PerspectiveCamera;
    private three_renderer: THREE.WebGLRenderer;
    private three_label_renderer: CSS2DRenderer;
    private three_composer: EffectComposer;
    private three_controls: OrbitControls;
    private width: number = 0;
    private height: number = 0;
    private scene: FScene;

    private three_blocks: { [id: Id]: THREE.Group } = {};
    private three_packages: { [id: Id]: THREE.Group } = {};

    public constructor(canvas: HTMLCanvasElement, scene: FScene) {
        this._canvas = canvas;
        this.width = canvas.getBoundingClientRect().width;
        this.height = canvas.getBoundingClientRect().height;
        this.scene = scene;
        this.three_scene = new THREE.Scene();
        this.three_camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
        this.three_camera.up = new THREE.Vector3(0, 0, 1);
        this.three_renderer = new THREE.WebGLRenderer({
            canvas: this._canvas,
            alpha: true,
            powerPreference: "high-performance",
            antialias: false,
            stencil: false,
            depth: false
        });
        this.three_label_renderer = new CSS2DRenderer();
        this.three_composer = new EffectComposer(this.three_renderer);
        this.three_controls = new OrbitControls(this.three_camera, this.three_renderer.domElement);
        this.init();

        ThreeScene.Instance = this;
    }

    public onResized(): void {
        if (this._canvas) {
            this.width = this._canvas.getBoundingClientRect().width;
            this.height = this._canvas.getBoundingClientRect().height;
            this.three_camera.aspect = this.width / this.height;
            this.three_camera.updateProjectionMatrix();
            this.three_renderer.setSize(this.width, this.height);
            this.three_composer.setSize(this.width, this.height);
            this.three_label_renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    private init(): void {
        this.three_renderer.setSize(this.width, this.height);
        this.three_scene.background = new THREE.Color(0xfd9a00);

        this.three_label_renderer.setSize(window.innerWidth, window.innerHeight);
        this.three_label_renderer.domElement.style.position = 'absolute';
        this.three_label_renderer.domElement.style.top = '0px';
        this._canvas.parentElement?.insertBefore(this.three_label_renderer.domElement, this._canvas);
        this.three_label_renderer.domElement.style.pointerEvents = 'none';

        this.three_camera.position.set(3, 3, 2);
        this.three_controls.target.set(0, 0.5, 0.5);
        this.three_controls.maxTargetRadius = 20;
        this.three_controls.maxPolarAngle = Math.PI / 2;
        this.three_controls.minDistance = 0.5;
        this.three_controls.maxDistance = 30;
        this.three_controls.screenSpacePanning = false;
        this.three_controls.update();

        this.three_composer.addPass(new RenderPass(this.three_scene, this.three_camera));

        const n8aoPass = new N8AOPostPass(this.three_scene, this.three_camera, this.width, this.height);
        n8aoPass.configuration.aoSamples = 8;
        n8aoPass.configuration.denoiseSamples = 6;
        n8aoPass.configuration.denoiseRadius = 12;
        n8aoPass.configuration.aoRadius = 0.8;
        n8aoPass.configuration.distanceFalloff = 0.75;
        n8aoPass.configuration.intensity = 3.0;
        n8aoPass.configuration.color = new THREE.Color(0, 0, 0);
        this.three_composer.addPass(n8aoPass);

        this.three_composer.addPass(new EffectPass(this.three_camera, new FXAAEffect()));

        const planeGeometry = new THREE.PlaneGeometry(100, 100);
        const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xfd9a00, side: THREE.DoubleSide });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.layers.enable(1);
        this.three_scene.add(plane);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(-3, 5, 7);
        this.three_scene.add(light);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        this.three_scene.add(ambientLight);

        this.scene.on('blocks', (edited, added, removed) => {
            removed.forEach(id => {
                const startTime = Time.Absolute;
                const interval = setInterval(() => {
                    if (!this.three_blocks[id]) return;
                    const diff = (Time.Absolute - startTime) * 10;
                    if (diff >= 1) {
                        clearInterval(interval);
                        this.three_scene.remove(this.three_blocks[id]);
                        delete this.three_blocks[id];
                    } else {
                        this.three_blocks[id].scale.set(1-diff, 1-diff, 1-diff);
                    }
                }, 20);
            });
            edited.forEach((block: FBlock) => delete this.three_blocks[block.id]);
            const added_and_edited = [...added].concat(edited);
            for (const blockId in added_and_edited) {
                if (this.three_blocks[blockId] === undefined) {
                    const block = added_and_edited[blockId];
                    if (!block) continue;

                    this.three_blocks[block.id] = block.model.model;
                    this.three_scene.add(block.model.model);

                    block.model.model.scale.set(0,0,0);

                    const startTime = Time.Absolute;
                    const interval = setInterval(() => {
                        const diff = (Time.Absolute - startTime) * 10;
                        if (diff >= 1) {
                            clearInterval(interval);
                            block.model.model.scale.set(1, 1, 1);
                        } else {
                            block.model.model.scale.set(diff, diff, diff);
                        }
                    }, 20);
                }
            }
        });
        
        this.scene.on('packages', (edited, added, removed) => {
            removed.forEach(id => {
                const startTime = Time.Absolute;
                const interval = setInterval(() => {
                    if (!this.three_packages[id]) return;
                    const diff = (Time.Absolute - startTime) * 10;
                    if (diff > 1) {
                        clearInterval(interval);
                        this.three_scene.remove(this.three_packages[id]);
                        delete this.three_packages[id];
                    } else {
                        this.three_packages[id].scale.set(1-diff, 1-diff, 1-diff);
                    }
                }, 20);
            });
            edited.forEach((pack: FPackage) => delete this.three_packages[pack.id]);
            const added_and_edited = [...added].concat(edited);
            for (const packId in added_and_edited) {
                if (this.three_packages[packId] === undefined) {
                    const pack = added_and_edited[packId];
                    if (!pack) continue;

                    createModel('package').then((model) => {
                        this.three_packages[pack.id] = model;
                        model.position.set(pack.position.x, pack.position.y, pack.position.z);
                        pack.position.on('update', (x, y, z) => model.position.set(x, y, z));
                        pack.rotation.on('update', (x, y, z, w) => model.quaternion.set(x, y, z, w));   
                        model.scale.set(0,0,0);
                        this.three_scene.add(model);

                        const startTime = Time.Absolute;
                        const interval = setInterval(() => {
                            const diff = (Time.Absolute - startTime) * 10;
                            if (diff >= 1) {
                                clearInterval(interval);
                                model.scale.set(1, 1, 1);
                            } else {
                                model.scale.set(diff, diff, diff);
                            }
                        }, 20);
                    });
                }
            }
        });
        
        // spawn all the blocks in the scene on first time
        for (const id in this.scene.blocks) {
            const block = this.scene.blocks[id];
            if (block) {
                this.three_blocks[block.id] = block.model.model;
                this.three_scene.add(block.model.model);
            }
        }

        this.animate();
    }

    private animate(): void {
        requestAnimationFrame(t => this.animate());
        
        this.three_controls.update();
        this.three_controls.target.z = 0.5; // force target to ground level
        this.three_composer.render();
        this.three_label_renderer.render(this.three_scene, this.three_camera);
    }

    public onDelete() {
        if (ThreeScene.Instance === this) {
            ThreeScene.Instance = null;
        }
    }

    public get canvas() { return this._canvas; }
    public get threescene() { return this.three_scene; }
    public get fscene() { return this.scene; }
    public get camera() { return this.three_camera; }
    public get renderer() { return this.three_renderer; }
    public get composer() { return this.three_composer; }
    public get controls() { return this.three_controls; }
}
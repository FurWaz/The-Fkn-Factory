import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

export function createModel(type: FBlockType|string): Promise<THREE.Group> {
    const path = "models/" + type.toLowerCase() + ".glb";
    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
        loader.load(path, (gltf) => {
            resolve(gltf.scene);
        }, undefined, (error) => {
            console.error(`Error loading model from ${path}:`, error);
            reject(error);
        });
    });
}
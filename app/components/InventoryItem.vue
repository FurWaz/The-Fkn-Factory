<template>
    <div class="btn-style p-1 h-fit" :class="selected === item ? '-translate-y-1' : ''">
        <canvas ref="canvas" class="w-14 h-14" />
    </div>
</template>

<script lang="ts" setup>
import * as THREE from 'three';
import type { FBlock } from '~/composables/FBlock';

const props = defineProps<{
    item: any,
    selected: any
}>();

const canvas = ref<HTMLCanvasElement|null>();
onMounted(() => {
    if (!canvas || !canvas.value) return;

    const rect = canvas.value.getBoundingClientRect();
    canvas.value.width = rect.width;
    canvas.value.height = rect.height;
    canvas.value.style.width = rect.width+'px';
    canvas.value.style.height = rect.height+'px';
    
    const block: FBlock = new props.item();
    block.body.onDelete(); // remove the physics colliders and all

    setTimeout(() => {
        if (!canvas.value) return;

        // Create scene
        const scene = new THREE.Scene();
        scene.add(block.model.model);

        // Compute bounding box
        const box = new THREE.Box3().setFromObject(block.model.model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Set up camera
        const aspect = canvas.value.width / canvas.value.height;
        const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        camera.up = new THREE.Vector3(0,0,1);

        // Position camera to the side (X axis), looking at the center
        const maxDim = Math.max(size.x, size.y, size.z);
        const distance = maxDim * 1.3;
        camera.position.set(center.x + distance, center.y, center.z + 1.1);
        camera.lookAt(center);

        // Set up renderer
        const renderer = new THREE.WebGLRenderer({ canvas: canvas.value, alpha: true, antialias: true });
        renderer.setSize(canvas.value.width, canvas.value.height);
        renderer.setClearColor(0x000000, 0); // transparent

        // Render
        renderer.render(scene, camera);
    }, 1000);
});

</script>

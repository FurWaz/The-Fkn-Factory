<template>
    <div ref="parent" class="flex grow overflow-hidden max-h-screen max-w-screen">
        <canvas ref="canvas" class="transition-opacity duration-500" style="opacity: 0;" />
    </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
    scene: FScene; // Replace 'any' with the actual type of your scene
}>();

const parent = ref<HTMLElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
    if (!parent.value || !canvas.value) {
        console.error('Parent or canvas element is not available');
        return;
    }

    const threeScene = new ThreeScene(canvas.value, props.scene);

    window.addEventListener('resize', () => {
        setTimeout(() => {
            if (parent.value && canvas.value) {
                canvas.value.style.width = parent.value.getBoundingClientRect().width+'px';
                canvas.value.style.height = parent.value.getBoundingClientRect().height+'px';
                threeScene.onResized();
            }
        }, 100);
    });

    canvas.value.style.width = parent.value.getBoundingClientRect().width+'px';
    canvas.value.style.height = parent.value.getBoundingClientRect().height+'px';
    threeScene.onResized();

    // show the canvas after initialization
    canvas.value.style.opacity = '1';
});

</script>

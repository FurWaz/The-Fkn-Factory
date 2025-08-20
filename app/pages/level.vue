<template>
    <div class="flex grow bg-primary-500">
        <NuxtLink class="absolute top-2 left-2 px-6 py-3 btn-style pointer-events-auto z-50" to="/menu">
            <p class="btn-text">Back</p>
        </NuxtLink>
        <div class="absolute w-full h-fit bottom-2 left-0 flex justify-center z-50">
            <div class="flex space-x-4 h-fit items-end">
                <InventoryItem v-for="item in inventory" :item="item" :selected="selectedItem" @click="() => onItemSelected(item)" />
            </div>
        </div>
        <div class="absolute w-fit h-fit bottom-2 right-2 space-x-4 flex z-50 items-end">
            <button v-show="!isReset" class="btn-style px-1 pt-1 h-fit" @click="resetLevel()">
                <UIcon name="i-heroicons-stop" size="3em" class="text-neutral-700" />
            </button>
            <div>
                <button v-show="isPlaying" class="btn-style px-1 pt-1 h-fit" @click="onPause">
                    <UIcon name="i-heroicons-pause" size="3em" class="text-neutral-700" />
                </button>
                <button v-show="!isPlaying" class="btn-style px-1 pt-1 h-fit" @click="onPlay">
                    <UIcon name="i-heroicons-play" size="3em" class="text-neutral-700" />
                </button>
            </div>
        </div>
        <div class="absolute w-fit h-fit bottom-2 left-2 space-x-4 flex z-50 items-end">
            <button class="btn-style px-1 pt-1 h-fit" @click="reloadLevel()">
                <UIcon name="i-heroicons-arrow-path" size="3em" class="text-neutral-700" />
            </button>
        </div>
        <Scene :scene="levelScene" />
    </div>
</template>

<script lang="ts" setup>
import * as THREE from 'three';
import { FBlockType, type FBlock } from '~/composables/FBlock';

const route = useRoute();
const router = useRouter();
const levelScene = new FScene();

const inventory = ref([
    FBlockStraight,
    FBlockCorner
]);
const selectedItem = ref<any>(null);

function createSelectionGrid() {
    const material = new THREE.LineBasicMaterial({color: 0x000000});

    const points = [];
    points.push(
        new THREE.Vector3( -0.5, -0.5, 0 ),
        new THREE.Vector3( -0.5,  0.5, 0 ),
        new THREE.Vector3(  0.5,  0.5, 0 ),
        new THREE.Vector3(  0.5, -0.5, 0 ),
        new THREE.Vector3( -0.5, -0.5, 0 ),
    );

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    line.layers.disable(1);
    return line;
}

const selectionGrid = createSelectionGrid();
const selectionPosition = new THREE.Vector3();

function spawnLevel() {
    const levelId = route.query.id;
    if (!levelId || !parseInt(levelId as string)) {
        alert(`Error : level id isn't specified`);
        router.back();
        return;
    }

    const levelObject = LEVELS.find(l => l.id === parseInt(levelId as string));
    if (!levelObject) {
        alert(`Error : level with id ${levelId} not found`);
        router.back();
        return;
    }

    levelObject.build(levelScene);
    Time.Reset();
}

function init() {
    Physics.Reset();
    spawnLevel();
    loop();

    const audio = document.getElementById('audio') as HTMLAudioElement|null;
    window.addEventListener('click', ev => {
        if (audio && audio.paused) audio.play();
    });

    ThreeScene.Current?.threescene.add(selectionGrid);
    ThreeScene.Current?.canvas.addEventListener('mousemove', ev => onMouseMoved(ev.x, ev.y));

    const downMousePos = new THREE.Vector2();
    let downTimeout: NodeJS.Timeout|null = null;
    const onMouseDown = (x: number, y: number) => {
        downMousePos.set(x, y);
        downTimeout = setTimeout(() => { onLongClick(); downTimeout = null; }, 500);
    };
    const onMouseUp = (x: number, y: number, button: number) => {
        if (downTimeout) {
            clearTimeout(downTimeout);
            downTimeout = null;
        } else return;

        const upMousePos = new THREE.Vector2(x, y);
        if (downMousePos.distanceTo(upMousePos) > 2) {
            console
            return;
        }
        switch (button) {
            case 0: onLeftClick(); break;
            case 1: onMiddleClick(); break;
            case 2: onRightClick(); break;
            default: break;
        }
    };
    const onMouseMove = () => {
        if (downTimeout) {
            clearTimeout(downTimeout);
            downTimeout = null;
        }
    }

    const isMobile = window.innerWidth <= 1200;
    const mobileTouchPos = new THREE.Vector2();
    if (isMobile) {
        ThreeScene.Current?.canvas.addEventListener('touchstart', ev => {
            console.log('touchstart');
            if (!ev.touches[0]) return;
            mobileTouchPos.set(ev.touches[0].clientX, ev.touches[0].clientY);
            setTimeout(() => { onMouseDown(mobileTouchPos.x, mobileTouchPos.y); }, 10);
        });
        ThreeScene.Current?.canvas.addEventListener('touchend', ev => {
            console.log('touchend');
            setTimeout(() => { onMouseUp(mobileTouchPos.x, mobileTouchPos.y, 0); }, 10);
        });
        ThreeScene.Current?.canvas.addEventListener('touchmove', ev => onMouseMove());
    } else {
        ThreeScene.Current?.canvas.addEventListener('mousedown', ev => {
            console.log('mousedown');
            onMouseDown(ev.x, ev.y);
        });
        ThreeScene.Current?.canvas.addEventListener('mouseup', ev => {
            console.log('mouseup');
            onMouseUp(ev.x, ev.y, ev.button);
        });
        ThreeScene.Current?.canvas.addEventListener('mousemove', ev => onMouseMove());
    }
}

function onMouseMoved(x: number, y: number) {
    if (!ThreeScene.Current) return;

    const pointer = new THREE.Vector2();
    pointer.x = (x / window.innerWidth) * 2 - 1;
    pointer.y = - (y / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    raycaster.setFromCamera( pointer, ThreeScene.Current.camera);
    const intersects = raycaster.intersectObjects(ThreeScene.Current.threescene.children, true)
        .filter(intersect => intersect.object !== selectionGrid);

    if (intersects.length > 0 && intersects[0]) {
        selectionPosition.set(Math.round(intersects[0].point.x), Math.round(intersects[0].point.y), 0.0);
        selectionGrid.position.set(selectionPosition.x, selectionPosition.y, 0.1);
    }
}

function onRightClick() {
    if (isPlaying.value) return;

    const block = levelScene.findBlockAt(new Vec3().copy(selectionPosition));
    if (!block) return;
    
    if (block.type === FBlockType.GENERATOR || block.type === FBlockType.TRUCK) return;

    levelScene.removeBlocks(block.id);
}

function onLongClick() {
    console.log('onLongClick');
    onRightClick(); // like a right click, but useful for mobile
}

function onLeftClick() {
    if (isPlaying.value) return;

    if (!selectedItem || !selectedItem.value) {
        console.error('trying to create but selectedItem is invalid', selectedItem.value);
        return;
    }

    if (levelScene.findBlockAt(new Vec3().copy(selectionPosition))) {
        onMiddleClick(); // rotate if already block
        return;
    }

    const block: FBlock = new selectedItem.value();
    block.position.copy(selectionPosition);
    levelScene.addBlocks(block);
}

function onItemSelected(item: any) {
    if (selectedItem.value === item) selectedItem.value = null;
    else selectedItem.value = item;
}

function onMiddleClick() {
    if (isPlaying.value) return;

    const block = levelScene.findBlockAt(new Vec3().copy(selectionPosition));
    if (!block) return;
    
    if (block.type === FBlockType.GENERATOR || block.type === FBlockType.TRUCK) return;

    block.orientation = (block.orientation + Math.PI / 2) % (Math.PI * 2);
}

function onPlay() {
    isPlaying.value = true;
    isReset.value = false;
}

function onPause() {
    isPlaying.value = false;
}

function reloadLevel() {
    // Physics.Reset();
    // spawnLevel();
    // Time.Reset();
    router.go(0);
}

function resetLevel() {
    isPlaying.value = false;
    levelScene.reset();
    isReset.value = true;
}

const isPlaying = ref(false);
const isReset = ref(true);

const pageRoute = window.location.href;
function loop() {
    if (window.location.href !== pageRoute)
        return;

    Time.Tick();
    if (isPlaying.value) {
        levelScene.update();
    }
    
    requestAnimationFrame(loop);
}

onMounted(() => init());

</script>

<style>
@import "tailwindcss";

</style>

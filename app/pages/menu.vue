<template>
    <div class="flex grow bg-primary-500">
        <div class="absolute top-0 left-0 flex w-full h-1/4 items-end justify-center space-x-6 z-50">
            <div class="title-spawn" style="animation-delay: 000ms;">
                <h1 class="title font-frosting"> The </h1>
            </div>
            <div class="title-spawn" style="animation-delay: 100ms;">
                <div class="fkn font-frosting">Fkn</div>
            </div>
            <div class="title-spawn" style="animation-delay: 200ms;">
                <h1 class="title font-frosting"> Factory </h1>
            </div>
        </div>
        <div class="absolute top-2 right-2 flex w-fit h-fit z-50">
            <button
                ref="playBtn"
                class="pt-1 px-1 btn-style"
                @click="toggleFullScreen"
            >
                <UIcon name="i-heroicons-arrows-pointing-out" size="2em" class="text-white" />
            </button>
        </div>
        <div class="absolute bottom-0 left-0 flex w-full h-fit items-end justify-center z-50 pointer-events-none">
            <button
                ref="playBtn"
                class="mb-[7%] px-6 py-3 btn-style transition-all"
                @click="onPlayClicked"
            >
                <p class="btn-text">Play !</p>
            </button>
        </div>
        <div ref="levelPanel"
            class="absolute top-0 left-0 flex w-full h-full items-center justify-center z-50 pointer-events-none transition-all"
            style="opacity: 0; transform: translateY(100%);">
            <div class="flex flex-col justify-center items-start space-y-4">
                <button @click="onReturnClicked" class="px-6 py-3 btn-style">
                    <p class="btn-text">Back</p>
                </button>
                <div class="flex w-[50vw] h-[50vh] space-x-2 z-50">
                    <div class="flex w-fit h-full justify-center items-center">
                        <button class="px-1 pt-1 btn-style"
                            @click="levelPrev">
                            <UIcon name="i-heroicons-chevron-left" size="3em" class="text-white" />
                        </button>
                    </div>
                    <div class="flex grow overflow-hidden items-center">
                        <div class="flex w-full h-full transition-all" :style="`transform: translateX(-${levelCursor}00%)`">
                            <div v-for="level in levels" class="flex flex-shrink-0 w-full h-full justify-center items-center">
                                <NuxtLink class="flex flex-col w-[90%] h-[90%] p-3 rounded-2xl btn-style"
                                    :to="`/level?id=${level.id}`">
                                    <div class="flex grow bg-neutral-50 rounded-lg border-2 border-neutral-700">

                                    </div>
                                    <div class="flex h-fit p-2 justify-center items-center">
                                        <p class="btn-text"> {{ level.name }} </p>
                                    </div>
                                </NuxtLink>
                            </div>
                        </div>
                    </div>
                    <div class="flex w-fit h-full justify-center items-center">
                        <button class="px-1 pt-1 btn-style"
                            @click="levelNext">
                            <UIcon name="i-heroicons-chevron-right" size="3em" class="text-white" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <Scene :scene="menuScene" />
    </div>
</template>

<script lang="ts" setup>
const menuScene = new FScene();

const pageRoute = window.location.href;
function loop() {
    if (window.location.href !== pageRoute)
        return;

    Time.Tick();
    menuScene.update();

    requestAnimationFrame(loop);
}

onMounted(() => {
    Physics.Reset();
    menuScene.addBlocks(
        new FBlockGenerator(new Vec3(-1, 0, 0), Orientation.PX),
        new FBlockStraight(new Vec3(0, 0, 0), Orientation.PX),
        new FBlockCorner(new Vec3(1, 0, 0), Orientation.PX),
        new FBlockCorner(new Vec3(1, 1, 0), Orientation.PY),
        new FBlockStraight(new Vec3(0, 1, 0), Orientation.NX),
        new FBlockTruck(new Vec3(-1, 1, 0), Orientation.NX, 10),
    );
    Time.Reset();
    loop();

    const audio = document.getElementById('audio') as HTMLAudioElement|null;
    window.addEventListener('click', ev => {
        if (audio && audio.paused) audio.play();
    });
});

const playBtn = ref<HTMLButtonElement|null>();
const levelPanel = ref<HTMLDivElement|null>();

const levels = ref([
    {id: 1, name: 'Level 1'},
    {id: 2, name: 'Level 2'},
    {id: 3, name: 'Level 3'},
]);

function toggleFullScreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        document.documentElement.requestFullscreen();
    }
}

function onPlayClicked() {
    if (!playBtn.value || !levelPanel.value) {
        console.error('playBtn or levelPanel is null');
        return;
    }

    playBtn.value.style.transform = 'translateY(300%)';
    playBtn.value.style.opacity = '0';

    levelPanel.value.style.transform = 'translateY(0%)';
    levelPanel.value.style.opacity = '100';
}

function onReturnClicked() {
    if (!playBtn.value || !levelPanel.value) {
        console.error('playBtn or levelPanel is null');
        return;
    }

    playBtn.value.style.transform = 'translateY(0%)';
    playBtn.value.style.opacity = '100';
    
    levelPanel.value.style.transform = 'translateY(100%)';
    levelPanel.value.style.opacity = '0';
}

const levelCursor = ref(0);
function levelPrev() {
    levelCursor.value = Math.max(0, levelCursor.value-1);
}
function levelNext() {
    levelCursor.value = Math.min(levelCursor.value+1, levels.value.length-1);
}

</script>

<style>
@import "tailwindcss";

.title {
    @apply text-8xl font-extrabold drop-shadow-2xl text-neutral-50;
    filter: drop-shadow(4px 4px 0px oklch(70.8% 0 0)) drop-shadow(0 16px 16px rgba(0, 0, 0, 0.2));
}

.fkn {
    @apply text-8xl italic font-extrabold drop-shadow-2xl text-red-500 rotate-6 translate-y-2 -translate-x-1;
    filter: drop-shadow(4px 4px 0px oklch(50.5% 0.213 27.518)) drop-shadow(0 16px 16px rgba(0, 0, 0, 0.2));
}

@keyframes titleSpawn {
    0% {
        transform: translateY(10px) rotate(5deg);
        opacity: 0;
    }

    50% {
        transform: translateY(-5px) rotate(-2deg);
        opacity: 0.5;
    }

    100% {
        transform: translateY(0);
        opacity: 1;
    }
}

.title-spawn {
    animation: titleSpawn 0.3s ease-in-out forwards;
    opacity: 0;
}

</style>
<template>
    <div class="flex grow justify-center items-center space-x-4">
        <UButton label="Plein écran" @click="toggleFullScreen" />
        <UButton label="Jouer" href="/menu" />
    </div>
</template>

<script lang="ts" setup>
function toggleFullScreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        document.documentElement.requestFullscreen();
    }
}
</script>

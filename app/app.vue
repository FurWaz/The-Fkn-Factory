<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <audio id="audio" src="/music/main.mp3" autoplay loop></audio>
  </div>
</template>

<script lang="ts" setup>

console.log('NUXT_APP_BASE_URL = ', import.meta.env.NUXT_APP_BASE_URL);
</script>
<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <audio id="audio" :src="makeUrl('/music/main.mp3')" autoplay loop></audio>
  </div>
</template>

<script lang="ts" setup>

</script>
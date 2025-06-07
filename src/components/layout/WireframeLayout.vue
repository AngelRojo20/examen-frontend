<template>
  <v-app>
    <Header />
    <v-main class="pa-4 mt-10">
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import Header from './Header.vue'
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

declare var module: any;

export default Vue.extend({
  mounted: () => {
    console.log('App mounted!')
  }
})
</script>

<style lang="less">
  h1 {
    color: rosybrown;
  }
</style>


<template>
<div class="container">
  <h1>{{ message }}</h1> 
  <img src="~@/assets/reindeer-power.gif" width="200" />
  <router-link :to="{name: 'Name', params: { name: 'foo' }}">Go to Name Page</router-link>
</div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello world!'
    }
  } 
}
</script>

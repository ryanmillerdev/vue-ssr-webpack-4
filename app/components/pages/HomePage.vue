<template>
<div class="container">
  <h1>{{ message }}</h1>
  <img src="~@/assets/reindeer-power.gif" width="200" />
  <div>
    <router-link :to="{name: 'Name', params: { name: 'foo' }}">Go to Name Page</router-link>
  </div>
  <div>
    <router-link :to="{ name: 'Number', params: { number: 1 } }">
      Learn about the number 1!
    </router-link>
  </div>
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

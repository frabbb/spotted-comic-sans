<script setup>
defineProps({
  error: Object
})
</script>

<template>
  <NuxtLayout>
    <pre>
      {{ error.statusMessage }}
    </pre>
  </NuxtLayout>
</template>

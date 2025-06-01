<template>
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800">
      <h1 class="text-6xl font-bold mb-4">Oops!</h1>
      <p class="text-xl mb-6">페이지를 찾을 수 없습니다.</p>
      <RouterLink
        to="/"
        class="px-4 py-2 bg-orange-500 text-white rounded-lg shadow hover:bg-orange-600 transition"
      >
        QR 코드를 다시 입력해주세요.
      </RouterLink>
    </div>
  </template>
  
  <script setup>
  import { RouterLink } from 'vue-router'
  </script>
  
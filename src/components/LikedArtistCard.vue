<script setup>
const props = defineProps({
  artist: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div class="liked-artist-card">
    <img :src="artist.img" :alt="artist.name" />
    <p class="liked-artist-name">{{ artist.name }}</p>
    <i v-if="artist.favorite" class="fa-solid fa-star favoris"></i>
  </div>
</template>

<style scoped>
.liked-artist-card {
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 10px;
  background-color: rgb(148, 148, 148);
  border-radius: 15px;
  overflow: hidden;
  width: 90%;
  min-height: 75px;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
}

.favoris {
  color: rgb(233, 167, 26);
  background-color: rgba(17, 17, 17, 0.5);
  padding: 5px;
  border-radius: 50px;

  i {
    font-size: 0.5rem;
  }
}

.liked-artist-card img {
  width: 20%;
  height: 100%;
  object-fit: cover;
}

.liked-artist-name {
  font-weight: 700;
}
</style>

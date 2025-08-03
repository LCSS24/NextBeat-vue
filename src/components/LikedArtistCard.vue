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
    <i v-if="artist.favorite" class="fa-solid fa-star favoris"></i>
    <p class="liked-artist-name">{{ artist.name }}</p>
    <div class="mini-mask"></div>
    <img :src="artist.img" :alt="artist.name" />
  </div>
</template>

<style scoped>
.liked-artist-card {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  background-color: rgb(148, 148, 148);
  border-radius: 25px;
  overflow: hidden;
  width: 120px;
  height: 120px;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
  margin-top: 15px;
}

.liked-artist-card:hover {
  transform: scale(1.1);
}

.favoris {
  position: absolute;
  top: 10%;
  right: 10%;
  z-index: 1;
  color: rgb(233, 167, 26);
  background-color: rgba(17, 17, 17, 0.5);
  padding: 5px;
  border-radius: 50px;

  i {
    font-size: 0.5rem;
  }
}

.mini-mask {
  position: absolute;
  background: linear-gradient(0deg, #111111 10%, rgba(0, 0, 0, 0) 100%);
  width: 100%;
  height: 100%;
}

.liked-artist-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.liked-artist-name {
  position: absolute;
  z-index: 1;
  font-weight: 700;
}
</style>

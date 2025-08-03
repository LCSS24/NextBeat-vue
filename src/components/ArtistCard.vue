<script setup>
import { ref, computed, watch } from "vue";
import { useLikedArtists } from "../composable/useLikedArtists";
import { fetchItunesPreview } from "../composable/fetchAudio";

// Props reçues du parent
const props = defineProps({
  artistes: {
    type: Array,
    required: true,
  },
});

const likedArtists = useLikedArtists(); // Utilisation du composable pour les artistes likés
const index = ref(0); // index réactif

// Artiste courant, mis à jour automatiquement quand index change
const artiste = computed(() => props.artistes[index.value]);

// Fonction pour aimer un artiste
function handleLike(artiste, isFavorite) {
  if (!likedArtists.value.find((a) => a.id === artiste.id)) {
    likedArtists.value.push({
      name: artiste.name,
      img: artiste.image,
      id: artiste.id,
      favorite: isFavorite,
    });
  } else {
    console.log(`${artiste.name} est déjà dans les likes`);
  }
}

// Passer à l’artiste suivant
function nextArtist() {
  if (index.value < props.artistes.length - 1) {
    index.value++;
  } else {
    console.log("Dernier artiste atteint !");
  }
}

console.log(likedArtists);

const previewUrl = ref(null);

watch(artiste, async (newArtist) => {
  if (newArtist && newArtist.name) {
    previewUrl.value = await fetchItunesPreview(newArtist.name);
  } else {
    previewUrl.value = null;
  }
});
</script>

<template>
  <div v-if="artiste" :key="artiste.id" class="card">
    <audio v-if="previewUrl" :src="previewUrl" autoplay hidden loop></audio>
    <div class="mask"></div>
    <button
      class="star-button"
      @click="
        () => {
          handleLike(artiste, true);
          nextArtist();
        }
      "
    >
      <i class="fa-solid fa-star"></i>
    </button>
    <div class="infos">
      <div class="info-bar">
        <div class="name">
          <h2>{{ artiste.name }}</h2>
        </div>
      </div>
      <div class="buttons">
        <button class="button no-like" @click="nextArtist">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <button
          @click="
            () => {
              handleLike(artiste, false);
              nextArtist();
            }
          "
          class="button like"
        >
          <i class="fa-solid fa-heart coeur"></i>
        </button>
      </div>
    </div>
    <img :src="artiste.image" :alt="artiste.name" />
    <img :src="artiste.image" :alt="artiste.name" class="imgblur" />
  </div>
</template>

<style>
.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: 500px;
  height: 100%;
  border-radius: 20px;
  padding: 0;
  margin: 0;
  user-select: none;
}

.star-button {
  position: absolute;
  border-radius: 50px;
  height: 75px;
  width: 75px;
  padding: 0;
  border: 0;
  cursor: pointer;
  background: #24242480;
  top: 2%;
  right: 2%;

  i {
    font-size: 2rem;
  }
}

.star-button:hover {
  background: #bb832f;
}

.card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
}

.mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(0deg, #111111 10%, rgba(0, 0, 0, 0) 100%);
  border-radius: 20px;
}

.infos {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 20%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.info-bar {
  height: 40%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.name {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 33%;
  height: 100%;
  overflow: hidden;

  h2 {
    color: rgb(255, 255, 255);
    margin: 0;
    font-size: 2rem;
    font-weight: 900;
    white-space: nowrap;
  }
}

.coeur {
  color: #ffffff;
  font-size: 2rem;
}

.buttons {
  width: 100%;
  height: 60%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-radius: 0 0 20px 20px;
  overflow: hidden;
}

.button {
  appearance: none;
  cursor: pointer;
  width: 50%;
  height: 100%;
  border: none;
  color: #ffffff;
  font-size: 2rem;
  margin: 0;
  background: none;
  i {
    padding: 5%;
  }
}
.like:hover {
  background: linear-gradient(0deg, #5f39ea 0%, #331df500 100%);
}
.no-like:hover {
  background: linear-gradient(0deg, #ac3030 0%, #331df500 100%);
}

.imgblur {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(200px);
  z-index: -1;
  border-radius: 20px;
}
</style>

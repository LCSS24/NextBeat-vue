<script setup>
import { fetchFrenchRapArtists } from "./composable/fetch";
import ArtistCard from "./components/ArtistCard.vue";
import { ref, onMounted, computed, watch } from "vue";
import { useLikedArtists } from "./composable/useLikedArtists";
import LikedArtistCard from "./components/likedArtistCard.vue";

const artistes = ref([]);
const likedArtists = useLikedArtists(); // Utilisation du composable pour les artistes likés
const search = ref("");
const volumeOpen = ref(false);
const filterFavorites = ref(false);

//Récupérer les artistes
onMounted(async () => {
  const data = await fetchFrenchRapArtists();
  artistes.value = data;
});

const show = ref(false); // Pour afficher/masquer la liste des artistes likés

const filteredLikedArtists = computed(() => {
  return likedArtists.value
    .filter((artist) =>
      artist.name.toLowerCase().includes(search.value.toLowerCase())
    )
    .filter((artist) => !filterFavorites.value || artist.favorite);
});
</script>

<template>
  <header>
    <h1>Next Beat</h1>
    <nav>
      <ul>
        <li @click="show = !show" :class="{ active: show }">Likes</li>
        <li>A propos</li>
      </ul>
      <button class="volume-button" @click="volumeOpen = !volumeOpen">
        <i class="fa-solid fa-volume-high"></i>
      </button>
    </nav>
  </header>
  <div class="volume" v-show="volumeOpen">
    <input type="range" class="slider" />
  </div>
  <main>
    <div class="cards-container">
      <ArtistCard v-if="artistes.length" :artistes="artistes" />
      <p v-else>Chargement...</p>
    </div>
    <div v-if="!artistes.length" class="loading">Chargement...</div>
    <div v-if="show" class="modale-likes" @click="show = false">
      <div class="likes-container" @click.stop>
        <button class="close" @click="show = false">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <h3>Artistes likés</h3>
        <div class="searchandfilters">
          <input
            type="text"
            v-model="search"
            class="searchbar"
            placeholder="Chercher un artiste..."
          />
          <i
            class="fa-solid fa-star filtrestar"
            @click="filterFavorites = !filterFavorites"
            :class="{ active: filterFavorites }"
          ></i>
        </div>
        <p v-if="likedArtists.length === 0">Aucun artiste liké</p>
        <div v-else class="likedArtistsContainer">
          <LikedArtistCard
            v-for="artist in filteredLikedArtists"
            :key="artist.id"
            :artist="artist"
          />
        </div>
      </div>
    </div>
  </main>
  <footer>
    <p>© 2025 Next Beat. Tous droits réservés.</p>
  </footer>
</template>

<style></style>

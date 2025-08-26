<script setup>
import { fetchFrenchRapArtists } from "./composable/fetch";
import ArtistCard from "./components/ArtistCard.vue";
import { ref, onMounted, computed, watch, onUnmounted } from "vue";
import { useLikedArtists } from "./composable/useLikedArtists";
import LikedArtistCard from "./components/LikedArtistCard.vue";

const artistes = ref([]);
const likedArtists = useLikedArtists(); // Utilisation du composable pour les artistes likés
const search = ref("");
const volumeOpen = ref(false);
const filterFavorites = ref(false);
const audioElement = ref(null);
const currentAudioUrl = ref(null);
const currentVolume = ref(parseInt(localStorage.getItem("volume")) || 80); // Charge le volume depuis localStorage ou utilise 80 par défaut

// Gestion du volume
const handleVolumeChange = (e) => {
  const newVolume = parseInt(e.target.value);
  currentVolume.value = newVolume;
  localStorage.setItem("volume", newVolume);
  if (audioElement.value) {
    audioElement.value.volume = newVolume / 100;
  }
};
const offset = ref(0);
const isLoading = ref(false);
const hasMore = ref(true);

async function loadMoreArtists() {
  if (isLoading.value || !hasMore.value) return;

  try {
    isLoading.value = true;
    const newArtists = await fetchFrenchRapArtists(offset.value);

    // Si on reçoit moins de 10 artistes, c'est qu'il n'y en a plus à charger
    if (newArtists.length < 10) {
      hasMore.value = false;
    }

    // Filtrer les artistes déjà likés
    const likedArtistIds = likedArtists.value.map((a) => a.id);
    const filteredNewArtists = newArtists.filter(
      (artist) => !likedArtistIds.includes(artist.id)
    );

    // Ajouter les nouveaux artistes à la liste existante
    artistes.value = [...artistes.value, ...filteredNewArtists];
    offset.value += 10;
  } catch (error) {
    console.error("Erreur lors du chargement des artistes:", error);
  } finally {
    isLoading.value = false;
  }
}

// Quand l'URL audio change
const handleAudioUrlChange = (url) => {
  if (audioElement.value) {
    audioElement.value.pause();
    audioElement.value = null;
  }

  if (url) {
    const audio = new Audio();
    audio.crossOrigin = "anonymous"; // Important!
    audio.src = url;
    audio.volume = currentVolume.value / 100;
    audio.loop = true;

    // Attendre que l'audio soit chargé avant de l'assigner
    audio.addEventListener("canplaythrough", () => {
      audioElement.value = audio;
      audio.play().catch((e) => console.error("Playback error:", e));
    });
  }
};

// Nettoyage quand le composant est démonté
onUnmounted(() => {
  if (audioElement.value) {
    audioElement.value.pause();
  }
});

//Récupérer les artistes
onMounted(async () => {
  await loadMoreArtists();
});

const show = ref(false); // Pour afficher/masquer la liste des artistes likés

const filteredLikedArtists = computed(() => {
  return likedArtists.value
    .filter((artist) =>
      artist.name.toLowerCase().includes(search.value.toLowerCase())
    )
    .filter((artist) => !filterFavorites.value || artist.favorite);
});

watch(
  () => artistes.value.length,
  (newLength) => {
    if (newLength < 5 && hasMore.value) {
      loadMoreArtists();
    }
  }
);
</script>

<template>
  <audio :key="currentAudioUrl" ref="audioElement" v-if="false"></audio>
  <header>
    <h1>Next Beat</h1>
    <nav>
      <ul>
        <li @click="show = !show" :class="{ active: show }">Likes</li>
        <li>A propos</li>
      </ul>
      <button class="volume-button" @click="volumeOpen = !volumeOpen">
        <i v-if="currentVolume >= 50" class="fa-solid fa-volume-high"></i>
        <i
          v-else-if="currentVolume < 50 && currentVolume > 1"
          class="fa-solid fa-volume-low"
        ></i>
        <i v-else class="fa-solid fa-volume-xmark"></i>
      </button>
    </nav>
  </header>
  <div class="volume" v-show="volumeOpen">
    <input
      type="range"
      class="slider"
      min="0"
      max="100"
      :value="currentVolume"
      @input="handleVolumeChange"
      :style="`--value: ${currentVolume}%`"
    />
  </div>
  <main>
    <div class="cards-container">
      <ArtistCard
        v-if="artistes.length"
        :artistes="artistes"
        :onAudioChange="handleAudioUrlChange"
        :audioElement="audioElement"
        @needMoreArtists="loadMoreArtists"
      />
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

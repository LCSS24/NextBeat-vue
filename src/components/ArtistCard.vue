<script setup>
import { ref, computed, watch, onUnmounted } from "vue";
import { useLikedArtists } from "../composable/useLikedArtists";
import { fetchItunesPreview } from "../composable/fetchAudio";
import { useAudioAnalyzer } from "../composable/useAudioAnalyzer";

const props = defineProps({
  artistes: {
    type: Array,
    required: true,
    default: () => [],
  },
  onAudioChange: {
    type: Function,
    required: true,
  },
  audioElement: {
    type: HTMLAudioElement,
    default: null,
  },
});

const { initializeAnalyzer, kickIntensity, cleanupAudioContext } =
  useAudioAnalyzer();
const likedArtists = useLikedArtists();
const index = ref(0);
const artiste = computed(() => props.artistes[index.value]);
const previewUrl = ref(null);
const currentTrackName = ref(null);
const currentAlbumName = ref(null);
const emit = defineEmits(["needMoreArtists"]);

watch(artiste, async (newArtist) => {
  if (newArtist && newArtist.name) {
    const preview = await fetchItunesPreview(newArtist.name);
    previewUrl.value = preview.url;
    currentTrackName.value = preview.trackName;
    currentAlbumName.value = preview.albumName;
    props.onAudioChange(preview.url);
  } else {
    previewUrl.value = null;
    currentTrackName.value = null;
    props.onAudioChange(null);
  }
});

// Observer les changements de l'élément audio
watch(
  () => props.audioElement,
  (newAudio) => {
    if (newAudio) {
      initializeAnalyzer(newAudio);
    }
  }
);

onUnmounted(() => {
  cleanupAudioContext();
});

const isAnimating = ref(false);
const hoverState = ref("none"); // 'none', 'like', 'no-like'

async function nextArtist() {
  if (index.value < props.artistes.length - 3) {
    // Si on n'est pas près de la fin, passer simplement au suivant
    setTimeout(() => {
      index.value++;
    }, 300);
  } else {
    // Si on approche de la fin, demander plus d'artistes
    emit("needMoreArtists");
    setTimeout(() => {
      index.value++;
    }, 300);
  }
}
function handleLike(artiste, isFavorite) {
  if (!likedArtists.value.find((a) => a.id === artiste.id)) {
    likedArtists.value.push({
      name: artiste.name,
      img: artiste.image,
      id: artiste.id,
      favorite: isFavorite,
    });
    localStorage.setItem("likedArtists", JSON.stringify(likedArtists.value));
  } else {
    console.log(`${artiste.name} est déjà dans les likes`);
  }
}

function animateAndNext(callback) {
  if (!isAnimating.value) {
    isAnimating.value = true;
    if (callback) callback();
    setTimeout(() => {
      isAnimating.value = false;
    }, 300); // durée animation en ms
  }
}

function handleNoLikeClick() {
  animateAndNext(() => {
    nextArtist();
  });
}

function handleLikeClick() {
  animateAndNext(() => {
    handleLike(artiste.value, false);
    nextArtist();
  });
}

function setHoverState(state) {
  if (!isAnimating.value) {
    hoverState.value = state;
  }
}
</script>

<template>
  <div class="card-wrapper" :class="{ hovered: !isAnimating }">
    <div
      v-if="artiste"
      :key="artiste.id"
      class="container-hover"
      :class="{
        'hover-like': hoverState === 'like',
        'hover-no-like': hoverState === 'no-like',
      }"
      style="transform-origin: bottom center"
    >
      <div
        class="container-click"
        :class="{ 'animate-click': isAnimating }"
        style="transform-origin: bottom center"
      >
        <div class="card">
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
                <div class="track-info">
                  <p class="track-name">
                    <i class="fa-solid fa-music"></i> {{ currentTrackName }}
                  </p>
                  <p
                    v-if="
                      currentAlbumName &&
                      !currentAlbumName.includes(currentTrackName)
                    "
                    class="album-name"
                  >
                    {{ currentAlbumName }}
                    <i class="fa-solid fa-compact-disc"></i>
                  </p>
                </div>
              </div>
            </div>
            <div class="buttons">
              <button
                class="button no-like"
                @click="handleNoLikeClick"
                @mouseenter="setHoverState('no-like')"
                @mouseleave="setHoverState('none')"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
              <button
                class="button like"
                @click="handleLikeClick"
                @mouseenter="setHoverState('like')"
                @mouseleave="setHoverState('none')"
              >
                <i class="fa-solid fa-heart coeur"></i>
              </button>
            </div>
          </div>
          <img :src="artiste.image" :alt="artiste.name" />
          <img
            :src="artiste.image"
            :alt="artiste.name"
            class="imgblur"
            :style="{
              transform: `scale(${kickIntensity})`,
              transition: 'transform 0.1s ease-out',
            }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.card-wrapper {
  display: inline-block; /* pour ne pas prendre toute la largeur */
  transform-origin: bottom center;
  transition: transform 0.3s ease;
}

.container-hover {
  transition: all 0.3s ease;
  transform-origin: bottom center;
}

.container-click {
  transform-origin: bottom center;
}

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

/* Animation quand la classe animate-click est ajoutée */
@keyframes clickAnimationLike {
  0% {
    transform: translateX(0px) translateY(0px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateX(30px) translateY(-30px) rotate(5deg);
    opacity: 0;
  }
}

@keyframes clickAnimationNoLike {
  0% {
    transform: translateX(0px) translateY(0px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateX(-30px) translateY(-30px) rotate(-5deg);
    opacity: 0;
  }
}

.animate-click {
  animation: clickAnimationLike 0.3s ease-out forwards;
}

/* Animation spécifique quand on clique sur no-like */
.container-hover.hover-no-like .animate-click {
  animation: clickAnimationNoLike 0.3s ease-out forwards;
}

.container-hover {
  transition: all 0.3s ease;
  transform-origin: bottom center;
  height: 100%;
}

.container-click {
  transform-origin: bottom center;
  height: 100%;
}

/* Hover rotation pour les boutons */
.container-hover.hover-no-like {
  transform: rotate(-5deg) translateY(-15px);
}

.container-hover.hover-like {
  transform: rotate(5deg) translateY(-15px);
}

.star-button {
  position: absolute;
  border-radius: 50px;
  height: 65px;
  width: 65px;
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  margin-bottom: 30px;

  h2 {
    color: rgb(255, 255, 255);
    margin: 0;
    font-size: 2rem;
    font-weight: 900;
    white-space: nowrap;
  }

  p {
    margin: 0;
  }
}

.coeur {
  color: #ffffff;
  font-size: 2rem;
}

.track-info {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  width: 100%;
  font-size: 0.9rem;
  gap: 15px;

  p {
    background-color: rgba(49, 49, 49, 0.5);
    border-radius: 20px;
    padding: 3px 10px;
    /* margin: 0 10px; */
  }
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
  filter: blur(150px);
  z-index: -1;
  border-radius: 20px;
  transition: transform 0.05s ease-out;
  will-change: transform;
  overflow: hidden;
}
</style>

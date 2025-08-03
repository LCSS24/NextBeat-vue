// src/composables/useLikedArtists.js
import { ref } from "vue";

const likedArtists = ref([]);

export function useLikedArtists() {
  return likedArtists;
}

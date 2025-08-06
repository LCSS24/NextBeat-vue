import { ref, watch } from "vue";

// Charge les likes existants au démarrage
const initialLikes = JSON.parse(localStorage.getItem("likedArtists")) || [];
const likedArtists = ref(initialLikes);

export function useLikedArtists() {
  // Sauvegarde automatique quand la liste change
  watch(likedArtists, (newVal) => {
    localStorage.setItem("likedArtists", JSON.stringify(newVal));
  }, { deep: true });

  return likedArtists;
}
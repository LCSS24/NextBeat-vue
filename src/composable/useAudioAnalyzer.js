import { ref, onUnmounted } from "vue";

export function useAudioAnalyzer() {
  let audioContext = null;
  let analyzer = null;
  let source = null;
  const kickIntensity = ref(1);
  const connectedElements = new WeakSet();

  function cleanupAudioContext() {
    console.log("🧹 Cleaning up audio context...");
    try {
      if (source) {
        source.disconnect();
      }
      if (analyzer) {
        analyzer.disconnect();
      }
      if (audioContext && audioContext.state !== "closed") {
        audioContext.close();
      }
    } catch (e) {
      console.warn("Cleanup error:", e);
    } finally {
      connectedElements.clear();
      source = null;
      analyzer = null;
      audioContext = null;
    }
  }

  function initializeAnalyzer(audioElement) {
    if (!audioElement) return;
    console.log("🎼 Initializing audio analyzer...");

    try {
      // Vérifier si l'élément est déjà connecté
      if (connectedElements.has(audioElement)) {
        console.log("⚠️ Audio element already connected, cleaning up first...");
        cleanupAudioContext();
      }

      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;

      source = audioContext.createMediaElementSource(audioElement);
      connectedElements.add(audioElement);

      source.connect(analyzer);
      analyzer.connect(audioContext.destination);

      console.log("✅ Audio context setup complete");

      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      function analyze() {
        if (!analyzer || !audioContext || audioContext.state !== "running")
          return;

        analyzer.getByteFrequencyData(dataArray);
        const kick =
          dataArray.slice(0, 4).reduce((acc, val) => acc + val, 0) / 1;
        kickIntensity.value = 1 + (kick / 255) * 0.4;
        requestAnimationFrame(analyze);
      }

      audioContext.resume().then(() => analyze());
    } catch (error) {
      console.error("❌ Error setting up audio context:", error);
      cleanupAudioContext();
    }
  }

  onUnmounted(() => {
    cleanupAudioContext();
  });

  return {
    initializeAnalyzer,
    kickIntensity,
    cleanupAudioContext,
  };
}

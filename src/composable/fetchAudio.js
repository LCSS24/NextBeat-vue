export async function fetchItunesPreview(query) {
  const HiphopRapID = 18;

  // Étape 1 : chercher l'artiste en France
  const artistRes = await fetch(
    `https://itunes.apple.com/search?term=${encodeURIComponent(
      query
    )}&entity=musicArtist&limit=3&country=FR`
  );
  const artistData = await artistRes.json();
  if (!artistData.results.length) return null;

  // Filtrer pour ne garder que les artistes Hip-hop/Rap
  const hiphopArtists = artistData.results.filter(
    (artist) => artist.primaryGenreId === HiphopRapID
  );

  // Si aucun artiste Hip-hop/Rap trouvé, retourner null
  if (!hiphopArtists.length) {
    console.log(`Aucun artiste Hip-hop/Rap trouvé pour "${query}"`);
    return null;
  }

  // Prendre le premier artiste Hip-hop/Rap
  const artistId = hiphopArtists[0].artistId;
  console.log(
    `Artiste Hip-hop/Rap sélectionné: ${hiphopArtists[0].artistName} (ID: ${artistId})`
  );

  // Étape 2 : chercher les morceaux directement via l'artistID
  const tracksRes = await fetch(
    `https://itunes.apple.com/lookup?id=${artistId}&entity=song&limit=10&country=FR`
  );
  const trackData = await tracksRes.json();

  // Étape 3 : filtrer les morceaux qui ont une preview disponible
  const validTracks = trackData.results.filter(
    (t) => t.wrapperType === "track" && t.previewUrl
  );

  console.log(validTracks);

  const tracksSansFt = validTracks.filter((track) => {
    const name = track.trackName.toLowerCase();
    const isSoloArtist =
      track.artistName.toLowerCase() ===
      hiphopArtists[0].artistName.toLowerCase();
    const noFt = !/\b(ft\.?|feat\.?)\b/.test(name);
    return isSoloArtist && noFt;
  });

  console.log(tracksSansFt);

  if (!tracksSansFt.length) {
    console.log(
      `Aucune preview sans featuring trouvée pour ${hiphopArtists[0].artistName}`
    );
    return null;
  }

  const random = Math.floor(Math.random() * tracksSansFt.length);
  return tracksSansFt[random].previewUrl;
}

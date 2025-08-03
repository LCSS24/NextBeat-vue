export async function fetchItunesPreview(query) {
  // Étape 1 : chercher l'artiste en France
  const artistRes = await fetch(
    `https://itunes.apple.com/search?term=${encodeURIComponent(
      query
    )}&entity=musicArtist&limit=1&country=FR`
  );
  const artistData = await artistRes.json();
  if (!artistData.results.length) return null;

  const artistId = artistData.results[0].artistId;

  // Étape 2 : chercher les morceaux en France
  const tracksRes = await fetch(
    `https://itunes.apple.com/search?term=${encodeURIComponent(
      query
    )}&entity=musicTrack&limit=15&country=FR`
  );
  const trackData = await tracksRes.json();

  // Étape 3 : filtrer les morceaux du bon artiste
  const validTracks = trackData.results.filter(
    (t) => t.artistId === artistId && t.previewUrl
  );

  if (!validTracks.length) return null;

  console.log(validTracks);
  const random = Math.floor(Math.random() * validTracks.length);
  return validTracks[random].previewUrl;
}

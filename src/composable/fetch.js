import artistes from "./ArtistsList.json";
const CLIENT_ID = "35d72b43f9c74d43a3ecd2c1044d9697";
const CLIENT_SECRET = "c5f71a30a6d74d1f870c19326122ac53";

//Fonction pour récupérer un token, fetch vers l'API Spotify puis inclure l'image de l'artiste dans la liste artistes
export async function fetchFrenchRapArtists() {
  // Si les artistes sont déjà en cache local, on les renvoie
  const cached = localStorage.getItem("artistes");
  if (cached) {
    return JSON.parse(cached);
  }

  // Sinon, on continue le fetch classique
  async function fetchAccessToken() {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }),
    });
    const data = await response.json();
    return data.access_token;
  }

  async function fetchArtistImage(artistName, accessToken) {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        artistName
      )}&type=artist`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const data = await response.json();
    if (data.artists.items.length > 0) {
      return data.artists.items[0].images[0]?.url || null;
    } else {
      return null;
    }
  }

  const accessToken = await fetchAccessToken();

  const updatedArtistes = await Promise.all(
    artistes.map(async (artiste) => {
      const image = await fetchArtistImage(artiste.name, accessToken);
      return { ...artiste, image };
    })
  );

  // Mise en cache dans le localStorage
  localStorage.setItem("artistes", JSON.stringify(updatedArtistes));

  return updatedArtistes;
}

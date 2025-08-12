const CLIENT_ID = "35d72b43f9c74d43a3ecd2c1044d9697";
const CLIENT_SECRET = "c5f71a30a6d74d1f870c19326122ac53";

//Fonction pour récupérer un token, fetch vers l'API Spotify puis inclure l'image de l'artiste dans la liste artistes
export async function fetchFrenchRapArtists(offset = 10) {
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

  try {
    const accessToken = await fetchAccessToken();
    console.log("✅ Token Spotify obtenu");

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=french rap&type=artist&limit=10&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur API Spotify: ${response.status}`);
    }

    const data = await response.json();
    console.log("🎵 Artistes récupérés:", data.artists.items.length);

    // Formater les données comme attendu par l'application
    const formattedArtists = data.artists.items.map((artist) => ({
      id: artist.id,
      name: artist.name,
      image: artist.images[0]?.url || null,
      popularity: artist.popularity,
    }));

    return formattedArtists;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des artistes:", error);
    return [];
  }
}

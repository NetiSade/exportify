interface Track {
  id: string | undefined;
  url: string | undefined;
}

interface SpotifyResponse {
  tracks: {
    items: Array<{
      id: string;
      // ... other fields
    }>;
    // ... other fields
  };
}

export async function searchTrack(
  trackName: string,
  artistName: string,
  accessToken: string
): Promise<Track | undefined> {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=track:${trackName}%20artist:${artistName}&type=track`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const data: SpotifyResponse = await response.json();
    const firstTrack = data.tracks.items[0];
    const trackId = firstTrack?.id;
    const trackUrl = "https://open.spotify.com/track/" + trackId;
    return {
      id: trackId,
      url: trackUrl,
    };
  } catch (error) {
    console.error("Error:", error);
  }
}

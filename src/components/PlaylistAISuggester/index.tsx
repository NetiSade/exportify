import TracksBaseData from "components/data/TracksBaseData";
import { promptPrefix } from "./consts";
import { searchTrack } from "api/searchTrack";
import { chatGoogleGenerativeAI } from "api/chatGoogleGenerativeAI";

class PlaylistAISuggester {
  accessToken: string;
  playlist: any;
  config: any;

  constructor(accessToken: string, playlist: any, config: any) {
    this.accessToken = accessToken;
    this.playlist = playlist;
    this.config = config;
  }

  async suggest() {
    try {
      console.log(
        `😎🔥 ~ suggest start ~ base playlist: ${this.playlist.name}`
      );
      const baseTracks = await this.getTracks();

      const generatedSuggestions = await this.generateSongSuggestions(
        baseTracks
      );

      console.log(
        "😎🔥 ~ PlaylistAISuggester ~ suggest ~ generatedSuggestions:",
        generatedSuggestions
      );

      const searchResults = await this.searchSpotifyTracks(
        generatedSuggestions
      );

      console.log(
        "😎🔥 ~ PlaylistAISuggester ~ suggest ~ searchResults:",
        searchResults
      );

      // map the search results to the generated suggestions
      const tracks = searchResults.map((track, index) => {
        return {
          ...generatedSuggestions[index],
          id: track?.id,
          url: track?.url,
        };
      });

      console.log(
        "😎🔥 ~ PlaylistAISuggester ~ suggest ~ generatedSuggestions + searchResults:"
      );
      console.table(tracks);
    } catch (error) {
      console.error("😎🔥 ~ Suggest error", error);
    }
  }

  async generateSongSuggestions(data: string[]) {
    try {
      const prompt = `${promptPrefix}\n${data.join("\n")}`;

      const response = await chatGoogleGenerativeAI(prompt);

      // remove the ```json``` markdown from the response
      const jsonStr = response.replace(/```json/gi, "").replace(/```/g, "");

      // convert the response to JSON
      const json = JSON.parse(jsonStr);

      // create a list of songs
      const songs: { name: string; artist: string; score: string }[] = json.map(
        (song: any) => {
          return {
            name: song.name,
            artist: song.artist,
            score: song.score,
          };
        }
      );

      return songs;
    } catch (error) {
      console.error("Error in generateSongSuggestions: ", error);
      throw error;
    }
  }

  async searchSpotifyTracks(
    songs: { name: string; artist: string; score: string }[]
  ) {
    try {
      // search for the track in Spotify
      const searchResults = await Promise.all(
        songs.map((song) =>
          searchTrack(song.name, song.artist, this.accessToken)
        )
      );

      return searchResults;
    } catch (error) {
      console.error("Error in searchSpotifyTracks: ", error);
      throw error;
    }
  }

  private getArtistsName(artists: any) {
    return artists.map((a: any) => a.name).join(", ");
  }

  async getTracks() {
    try {
      const tracksBaseData = new TracksBaseData(
        this.accessToken,
        this.playlist
      );
      const items = await tracksBaseData.trackItems();

      const tracks = items.map(
        (i) =>
          `"Track Name: ${i.track.name}", Artist: ${this.getArtistsName(
            i.track.artists
          )}, Release Date: ${i.track.album.release_date}`
      );

      return tracks;
    } catch (error) {
      console.error("Error in getTracks: ", error);
      throw error;
    }
  }
}

export default PlaylistAISuggester;

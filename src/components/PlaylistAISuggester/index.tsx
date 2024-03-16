import TracksBaseData from "components/data/TracksBaseData";
import { HumanMessage } from "@langchain/core/messages";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { promptPrefix } from "./consts";
import { searchTrack } from "components/data/searchTrack";

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
    console.log(`😎🔥 ~ suggest start ~ base playlist: ${this.playlist.name}`);
    return this.getTracks()
      .then(async (data) => {
        const prompt = `${promptPrefix}\n${data.join("\n")}`;

        const contents = [
          new HumanMessage({
            content: [
              {
                type: "text",
                text: prompt,
              },
            ],
          }),
        ];

        const response = new ChatGoogleGenerativeAI({
          modelName: "gemini-pro",
          apiKey: "AIzaSyDqsl6ucn298DNByeiuT09gUQpCTl6aVZ0",
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
          ],
        });

        // Multi-modal streaming
        const streamRes = await response.stream(contents);

        // Read from the stream and interpret the output as markdown
        const buffer = [];

        for await (const chunk of streamRes) {
          buffer.push(chunk.content);
        }

        // remove the ```json``` markdown
        const jsonStr = buffer
          .join("")
          .replace(/```json/g, "")
          .replace(/```/g, "");

        // convert the response to JSON
        const json = JSON.parse(jsonStr);

        // create a list of songs
        const songs: { name: string; artist: string; score: string }[] =
          json.map((song: any) => {
            return {
              name: song.name,
              artist: song.artist,
              score: song.score,
            };
          });

        console.log(
          "😎🔥 ~ AI RESPONSE ~\n",
          songs.map((s) => `${s.name} - ${s.artist} - ${s.score}`).join("\n")
        );

        // search for the track in Spotify
        const searchResults = await Promise.all(
          songs.map((song) =>
            searchTrack(song.name, song.artist, this.accessToken)
          )
        );

        // create a list of tracks
        const tracks = searchResults.map((track, index) => {
          return {
            ...songs[index],
            id: track?.id,
            url: track?.url,
          };
        });

        console.log("😎🔥 ~ PlaylistAISuggester ~ tracks ~ tracks:", tracks);
      })

      .catch((error) => {
        console.error("😎🔥 ~ Suggest error", error);
      });
  }

  private getArtistsName(artists: any) {
    return artists.map((a: any) => a.name).join(", ");
  }

  async getTracks() {
    const tracksBaseData = new TracksBaseData(this.accessToken, this.playlist);
    const items = await tracksBaseData.trackItems();

    const tracks = items.map(
      (i) =>
        `"Track Name: ${i.track.name}", Artist: ${this.getArtistsName(
          i.track.artists
        )}, Release Date: ${i.track.album.release_date}`
    );
    return tracks;
  }
}

export default PlaylistAISuggester;

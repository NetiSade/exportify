import TracksBaseData from "components/data/TracksBaseData";
import { HumanMessage } from "@langchain/core/messages";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

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
    console.log("😎🔥 ~ suggest start");
    return this.getTracks()
      .then(async (data) => {
        const prompt = `I have compiled a list of songs that I love listening to. Help me create a playlist of 10 songs that match my music taste. Analyze my favorite songs and select tracks that are similar in genre, style, and mood to discover new music I'll enjoy. At least one-third of the list must contain artists whose songs are not included in the attached list to help expose artists I do not know. Don't suggest songs that are already on the list! Your response should contain 10 suggested songs in a JSON format; the song JS should match this type:{name: string, artist: string}. Please do your best, it's very important to me. This is the list:\n${data.join(
          "\n"
        )}`;

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
          apiKey: process.env.GOOGLE_API_KEY,
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
        const songs: { name: string; artist: string }[] = json.map(
          (song: any) => {
            return {
              name: song.name,
              artist: song.artist,
            };
          }
        );

        console.log(
          "😎🔥 ~ AI RESPONSE ~\n",
          songs.map((s) => `${s.name} - ${s.artist}`).join("\n")
        );
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

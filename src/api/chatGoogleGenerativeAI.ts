import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { HumanMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const chatGoogleGenerativeAI = async (
  prompt: string
): Promise<string> => {
  try {
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

    return buffer.join("");
  } catch (error) {
    console.error(error);
    throw error;
  }
};

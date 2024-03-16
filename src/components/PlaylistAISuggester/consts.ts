export const promptPrefix = `I've curated a selection of songs that resonate with me deeply. 
I'm seeking assistance in crafting a playlist of 10 tracks that align with my musical preferences.
Your task is to examine the songs I've provided, discerning their genres, styles, and moods,
and then recommend similar tracks to expand my musical horizons.
Ensure that at least one-third of the playlist comprises artists not featured in the attached list,
thereby introducing me to new talents. Please refrain from suggesting songs already present in the list.
Your recommendations should be presented in JSON format, with each song entry structured as follows:
{ "name": "Song Name", "artist": "Artist Name", "score": 1-10 }.
Please assign a score from one to ten to each recommended song to reflect its suitability to my taste, with a score of 10 indicating the highest suitability and a score of 1 suggesting a low chance of compatibility.
Your effort means a lot to me, so please put your best foot forward. Below is the list of songs for your reference:`;

import axios from "axios";

export async function googleSearch(query: string) {
  const uri = `https://www.googleapis.com/customsearch/v1`;
  try {
    const response = await axios.get(uri, {
      params: {
        key: process.env.GOOGLE_CUSTOM_SEARCH_API_KEY,
        cx: process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID,
        q: query,
      },
    });

    return response.data.items.map((item: any) => item.link)
  } catch (error) {
    console.error("Error: Google Search fail.", error);
  }
}

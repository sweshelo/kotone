import { JSDOM } from "jsdom";
import axios from "axios";

export async function fetchUrl(url: string) {
  try {
    const req = await axios.get(url);
    const html = req.data;

    const dom = new JSDOM(html);
    const { document } = dom.window;

    const main =
      document
        .querySelector("main")
        ?.textContent?.split("\n")
        .map((r) => r.trim())
        .filter((r) => r)
        .join("\n") ??
      document
        .querySelector("body")
        ?.textContent?.split("\n")
        .map((r) => r.trim())
        .join("\n");

    return {
      url,
      docs: main ?? 'Error. Fail to fetch contents.'
    };
  } catch (e) {
    return {
      url,
      docs: 'Error. Fail to fetch contents.'
    }
  }
}

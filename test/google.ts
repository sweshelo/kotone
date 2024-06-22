import { googleSearch } from "../src/google";
import "dotenv/config"

async function main(){
  const result = await googleSearch("TypeScript")
  console.log(result)
}

main();

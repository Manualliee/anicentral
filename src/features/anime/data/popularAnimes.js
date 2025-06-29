import { GET_POPULAR_ANIMES } from "../services/anilistQueries";
import Image from "next/image";

export default async function fetchPopularAnimes() {
    const res = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: GET_POPULAR_ANIMES }), // FIX: use 'query' key
    });
    const data = await res.json();
    //holds popular animes from popularAnimes.js 
    // Check anilist.co/graphql for the structure
    const animes = data.data.Page.media;

    // Filter to only originals (no prequel TV anime)
    const originals = animes.filter(anime =>
        !anime.relations?.edges?.some(
            rel => 
            rel.relationType === "PREQUEL" && 
            rel.node?.type === "ANIME" && 
            rel.node?.format === "TV"
        )
    );

    return (
        <div>
              {originals.map(anime => (
                <div key={anime.id}>
                  <Image 
                    src={anime.coverImage.large}
                    alt={anime.title.english || anime.title.romaji}
                    width={200}
                    height={300}
                  />
                  <h2>{anime.title.english}</h2>
                  <p>{anime.seasonYear}</p>
                </div>
              ))}
        </div>
    );
}
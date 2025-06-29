"use client";
import { useState } from "react";
import { SEARCH_ANIME_QUERY } from "../services/anilistQueries";
import Image from "next/image";

export default function AnimeSearch() {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [error, setError] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const data = await fetchSearchResults();
            //filers out adult content(NSFW)
            setResults(data.data.Page.media.filter(anime => !anime.isAdult));
        } catch (error) {
            setError("Failed to fetch search results");     
        }
        setLoading(false);
    }

    async function fetchSearchResults() {
        const res = await fetch("https://graphql.anilist.co", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    { 
                        query: SEARCH_ANIME_QUERY,
                        variables: { search: query, page: 1 } 
                    }
                ),
            });
        const data = await res.json();
        return data;
    }

    return (
        <div>
            <form onSubmit={handleSubmit} className="mb-4">
                <input 
                    className="border p-2 rounded"
                    type="text"
                    placeholder="Search for anime..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={loading}
                />
                <button 
                    className="bg-blue-500 text-white p-2 rounded ml-2"
                    type="submit"
                    disabled={loading || !query.trim()}
                >
                    {loading ? "Searching..." : "Search"}
                </button>
            </form>

            {error && <div className="text-red-600 mb-2">{error}</div>}
            {loading && <div className="mb-2">Loading...</div>}
            {!loading && results.length === 0 && query && (
                <div className="text-gray-500">No results found.</div>
            )}

            {results.map(anime => (
                <div key={anime.id} className="mb-4">
                    <Image 
                        src={anime.coverImage.large}
                        alt={anime.title.english || anime.title.romaji}   
                        width={200}
                        height={300}
                    />
                    <h2>{anime.title.english || anime.title.romaji}</h2>
                    <p>{anime.seasonYear}</p>
                </div>
            ))}
        </div>
    )
}
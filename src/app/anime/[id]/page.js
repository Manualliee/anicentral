import ExpandableDescription from '@/components/ExpandableDescription';
import { GET_ANIME_DETAILS } from "@/features/anime/services/anilistQueries";
import Image from "next/image";
import Link from "next/link";

function formatAnimeDate({ year, month, day }) {
    if (!year || !month || !day) return "Unknown";
    // JS months are 0-based(0=January, December=11), so subtract 1 from month
    const date = new Date(year, month - 1, day);
    return date.toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default async function AnimeDetailsPage({ params }) {
        const { id } = await params;
        const res = await fetch("https://graphql.anilist.co", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                query: GET_ANIME_DETAILS,
                variables: { id: Number(id) }
                }),
                cache: "no-store"
        });
        const data = await res.json();

        if (!data || !data.data || !data.data.Media) {
            return (
                <div className="p-8 text-center text-red-500">
                    Anime not found or failed to load. Please check the ID or try again later.<br />
                    <pre className="text-xs text-left whitespace-pre-wrap bg-gray-900 text-gray-200 p-2 mt-4 rounded">{JSON.stringify(data, null, 2)}</pre>
                </div>
            );
        }
        const anime = data.data.Media;
        // Find the main studio using isMain from edges
        let mainStudio = null;
        // Check if studios exist and have edges
        // This ensures we only process studios if they are available
        if (anime.studios && anime.studios.edges && anime.studios.edges.length > 0) {
            // Find the main studio edge
            // This allows us to get the main studio directly from the edges
            const mainEdge = anime.studios.edges.find(edge => edge.isMain);
            // If a main studio edge is found, set mainStudio to the node
            // This ensures we only use the main studio if it exists
            mainStudio = mainEdge ? mainEdge.node : null;
        }

        // Deduplicate producers by name and filter out the main studio if present
        let uniqueProducers = [];
        // Check if producers exist and have edges
        // This ensures we only process producers if they are available
        if (anime.producers && anime.producers.edges && anime.producers.edges.length > 0) {
            // Use a Set to track seen names for deduplication
            // This prevents duplicates and ensures the main studio is not included in producers
            const seen = new Set();
            // Normalize the main studio name for comparison
            // Trim whitespace and convert to lowercase for consistent comparison
            const mainStudioNormalized = mainStudio ? mainStudio.name.trim().toLowerCase() : null;
            // Filter producers, removing duplicates and the main studio
            // This ensures we only include unique producers and skip the main studio if it's in the list
            uniqueProducers = anime.producers.edges
                .map(edge => edge.node)
                .filter((producer) => {
                    // Normalize producer name for comparison
                    // Trim whitespace and convert to lowercase for consistent comparison
                    const normalized = producer.name.trim().toLowerCase();
                    // Skip if it's the main studio
                    // This prevents duplicates and ensures the main studio is not included in producers
                    if (mainStudioNormalized && normalized === mainStudioNormalized) return false;
                    // Skip if already seen
                    // This ensures we only include unique producers
                    if (seen.has(normalized)) return false;
                    // Add to seen set
                    // This allows us to track which producers we've already included
                    seen.add(normalized);
                    return true;
                });
        }

  return (
    <div>
        <div className="banner-container">
            {/* Banner image as background (no rounded corners) with bottom gradient shadow */}
            {anime.bannerImage && (
                <div
                    className="w-full h-48 md:h-80 bg-cover bg-center relative"
                    style={{ 
                        backgroundImage: `url(${anime.bannerImage})`,
                    }}
                >
                    {/* Inset gradient shadow at the bottom */}
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute bottom-0 left-0 w-full h-32 md:h-40" style={{
                            background: 'linear-gradient(to top, rgba(0,0,0,0.5) 55%, transparent 100%)'
                        }} />
                    </div>
                </div>
            )}
        </div>
        
        <div className="w-full bg-gray-800">
            <div className="relative p-5 flex flex-col md:flex-row mx-auto max-w-5xl justify-center min-h-[15rem]">
                {/* Cover image, absolute on desktop for overlap effect */}
                <div className="md:absolute md:left-8 md:top-[-6rem] w-full md:w-48 flex-shrink-0 flex justify-center md:justify-start z-10">
                    <Image
                    src={anime.coverImage.extraLarge}
                    alt={anime.title.romaji}
                    className="rounded shadow object-cover w-48 h-68"
                    width={192}
                    height={272}
                    />
                </div>
                {/* Description, with responsive margin that matches image width + left offset, prevents overflow, and limits max width */}
                <div className="mt-4 md:mt-0 w-full max-w-full md:max-w-2xl box-border overflow-x-auto md:ml-[calc(12rem+2rem)] flex-1">
                    <h1 className="text-2xl font-bold mb-2">
                    {anime.title.english || anime.title.romaji}
                    </h1>
                    <ExpandableDescription html={anime.description || ''} collapsedLines={5} />
                </div>
            </div>
        </div>

        <div className="border max-w-full mx-auto p-6 flex flex-col md:flex-row gap-15">
            <div className="border border-green-600 [&_p]:text-sm md:p-6 space-y-4">
                <div>
                    <p>Titles</p>
                    <p>{anime.title.english}</p>
                    <p>{anime.title.romaji}</p>
                    <p>{anime.title.native}</p>
                </div>

                <div>
                    <p>Format</p>
                    <p>{anime.format}</p>
                </div>

                <div>
                    <p>Episodes</p>
                    <p>{anime.episodes}</p>
                </div>

                <div>
                    <p>Status</p>
                    <p>{anime.status}</p>
                </div>

                <div>
                    <p>Start Date</p>
                    <p>{formatAnimeDate(anime.startDate)}</p>
                </div>

                <div>
                    <p>End Date</p>
                    <p>{formatAnimeDate(anime.endDate)}</p>
                </div>

                <div>
                    <p>Season</p>
                    <p>{anime.season} {anime.seasonYear}</p>
                </div>

                <div>
                    <p>Average Score</p>
                    <p>{anime.averageScore}%</p>
                </div>

                <div>
                    <p>Mean Score</p>
                    <p>{anime.meanScore}%</p>
                </div>

                <div>
                    <p>Studio</p>
                    <p>{mainStudio ? mainStudio.name : "Unknown"}</p>
                </div>

                <div>
                    <p>Producers</p>
                    {uniqueProducers.length > 0
                    ? uniqueProducers.map((producer) => (
                        <p key={producer.name}>{producer.name}</p>
                    ))
                    : <p>None</p>}
                </div>

                <div>
                    <p>Source</p>
                    <p>{anime.source}</p>
                </div>

                <div>
                    <p>Genres</p>
                    {anime.genres.map((genre, index) => (
                        <p key={index}>{genre}</p>
                    ))}
                </div>
            </div>

            <div className='w-full border'>

                <div className='border border-blue-600 w-full grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 xs:grid-cols-1 gap-x-5 gap-y-4 min-w-[9rem]'>
                    {anime.characters?.edges?.map(edge => {
                        let mainRole = null;
                        if (edge.voiceActorRoles && edge.voiceActorRoles.length > 0) {
                            mainRole = edge.voiceActorRoles.find(role => !role.roleNotes) || edge.voiceActorRoles[0];
                        }
                        return (
                            <div key={edge.node.id} className='border border-amber-500 w-55 h-45 flex flex-row justify-between gap-2 p-2 sm:w-full xs:w-full'>
                                <div className='border flex flex-col w-full sm:w-[5rem] h-[6.67rem]'>
                                    <Image
                                        src={edge.node.image.large}
                                        alt={edge.node.name.full}
                                        width={300}
                                        height={400}
                                        className='object-cover w-full h-full'
                                    />
                                    {edge.node.name.full.split(' ').map((part, idx) => (
                                        <p key={idx} className='text-sm'>{part}</p>
                                    ))}
                                </div>
                                {mainRole && (
                                    <div className='border flex flex-col w-full sm:w-[5rem] h-[6.67rem]'>
                                        <Image
                                            src={mainRole.voiceActor.image.large}
                                            alt={mainRole.voiceActor.name.full}
                                            width={300}
                                            height={400}
                                            className='object-cover w-full h-full'
                                        />
                                        <div>
                                            {mainRole.voiceActor.name.full.split(' ').map((part, idx) => (
                                                <p key={idx} className='text-sm'>{part}</p>
                                            ))}
                                            <p>({mainRole.voiceActor.language})</p>
                                            {mainRole.roleNotes && (
                                                <p className='text-sm'>{mainRole.roleNotes}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                    
                <div>
                    {/* Display trailer if available */}
                    {anime.trailer && anime.trailer.site === "youtube" && (
                        <div className="mt-4">
                        <iframe
                            width="360"
                            height="215"
                            src={`https://www.youtube.com/embed/${anime.trailer.id}`}
                            title="Trailer"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                         />
                         </div>
                    )}
                    <a href={anime.siteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mt-4 block">
                        View on AniList
                    </a>
                </div>
            </div>
        </div>
        {/* Move Back to Home button to the bottom of the page */}
        <div className="px-4 mt-8">
          <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">&larr; Back to Home</Link>
        </div>
    </div>
  );
}

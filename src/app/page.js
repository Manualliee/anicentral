import AnimeSearch from "../features/anime/components/AnimeSearch";
import PopularAnimes from "../features/anime/data/popularAnimes";
import { fetchAnimesBySearch } from "../features/anime/services/anilistQueries";
export default function Home() {
  
  return (
    <div>
      <AnimeSearch />
      <PopularAnimes />
    </div>
  );
}

//queries from https://anilist.co/graphql
export const GET_POPULAR_ANIMES = `
  query {
    Page(page: 1, perPage: 20){
      media(type: ANIME, sort: POPULARITY_DESC) {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
        }
        seasonYear
        relations {
          edges {
            relationType
            node {
              id
              type
              format
            }
          }
        }
      }
    }
  }
`;

export const SEARCH_ANIME_QUERY = `
  query ($search: String, $page: Int) {
    Page (page: $page, perPage: 10) {
      pageInfo {
        currentPage
        hasNextPage
      }
      media (type: ANIME, search: $search) {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
        }
        seasonYear
        isAdult
      }
    }
  }
`;
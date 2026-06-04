export interface Reaction {
  emoji: string
  count: number
}

export interface FeedEntry {
  id: number
  title: string
  artist: string
  album: string
  genre: string
  datePosted: string       // ISO 8601
  postedBy: string         // Discord username
  youtubeId: string | null // null if only Spotify/Tidal link was posted
  siteName: 'youtube' | 'spotify' | 'tidal'
  sourceUrl: string
  reactions: Reaction[]
}

export type SortOption = 'date-desc' | 'date-asc' | 'reactions'

export interface Filters {
  genre: string
  artist: string
  postedBy: string
}

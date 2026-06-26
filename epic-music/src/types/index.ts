export interface Reaction {
  emoji: string
  count: number
}

export interface FeedEntry {
  id: number
  title: string
  album: string
  siteName: 'youtube' | 'spotify' | 'tidal'
  originalUrl: string
  youtubeId: string
  youtubeTitle: string
  message: string | null
  messageId: number
  datePosted: string // ISO 8601
  postedBy: string // Discord username
  avatar: string | null
  artists: string[]
  genres: string[]
  reactions: Reaction[]
}

export type SortOption = 'date-desc' | 'date-asc' | 'reactions'

export interface FeedPage {
  entries: FeedEntry[]
  uniqueArtists: string[]
  uniqueGenres: string[]
  uniquePosters: string[]
  total: number
}

export interface Filters {
  siteNames?: string[]
  artists?: string[]
  genres?: string[]
  posters?: string[]
}

export interface ListFeedRequest {
  siteNames?: string[]
  artists?: string[]
  genres?: string[]
  posters?: string[]
  sortBy: "date_posted" | "reactions"
  sortOrder: "asc" | "desc"
  page: number
}

export interface TaskStartResponse {
  status: "success" | "already_running" | "error"
  taskId: string
}

export interface TaskStatusResponse {
  status: "success" | "running" | "missing" | "error"
}

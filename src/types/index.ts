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
  messageId: number
  postedBy: string // Discord username
  postedAt: string // ISO 8601
  artists: string[]
  genres: string[]
  reactions: Reaction[]
}

export type SortOption = 'date-desc' | 'date-asc' | 'reactions'

export interface FeedPage {
  entries: FeedEntry[]
  total: number
}

export interface Filters {
  siteName: string
  artist: string
  genre: string
  postedBy: string
}

export interface ListFeedRequest {
  filters: Filters
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

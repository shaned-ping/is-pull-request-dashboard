export interface PullRequest {
  id: number
  number: number
  title: string
  html_url: string
  created_at: string
  updated_at: string
  user: {
    login: string
    avatar_url: string
    html_url: string
  }
  repository: {
    name: string
    full_name: string
    html_url: string
  }
  draft: boolean
  state: 'open' | 'closed'
}

export interface GitHubSearchResponse {
  total_count: number
  incomplete_results: boolean
  items: PullRequest[]
}

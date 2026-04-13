export interface GithubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  html_url: string;
  fork: boolean;
  updated_at: string;
  owner: {
    login: string;
  };
}

export interface GithubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

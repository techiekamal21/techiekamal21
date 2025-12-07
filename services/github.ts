import { GitHubUser, GitHubRepo, GitHubEvent } from '../types';

const BASE_URL = 'https://api.github.com';
const USERNAME = 'techiekamal21';

// Mock data in case API rate limit is hit or network fails
const MOCK_USER: GitHubUser = {
  login: "techiekamal21",
  avatar_url: "https://avatars.githubusercontent.com/u/123456?v=4", // Generic placeholder if fetch fails
  html_url: "https://github.com/techiekamal21",
  name: "Kamal",
  company: "ConnectKreations",
  blog: "www.connectkreations.com",
  location: "India",
  email: null,
  bio: "Full Stack Developer | Tech Blogger | Tool Creator. Building the future at ConnectKreations & Ideaota.",
  public_repos: 42,
  followers: 120,
  following: 15,
  created_at: "2018-01-01T00:00:00Z"
};

const MOCK_REPOS: GitHubRepo[] = [
  {
    id: 1,
    name: "awesome-portfolio",
    full_name: "techiekamal21/awesome-portfolio",
    private: false,
    html_url: "https://github.com/techiekamal21",
    description: "An advanced React portfolio built with Gemini API.",
    fork: false,
    url: "",
    created_at: "2023-01-01",
    updated_at: "2023-12-01",
    homepage: "https://ideaota.com",
    stargazers_count: 15,
    watchers_count: 15,
    language: "TypeScript",
    forks_count: 2,
    topics: ["react", "ai", "gemini"]
  },
  {
    id: 2,
    name: "connect-tools",
    full_name: "techiekamal21/connect-tools",
    private: false,
    html_url: "https://github.com/techiekamal21",
    description: "Tools for interview preparation and job updates.",
    fork: false,
    url: "",
    created_at: "2023-02-01",
    updated_at: "2023-11-01",
    homepage: "https://connectkreations.com",
    stargazers_count: 24,
    watchers_count: 24,
    language: "JavaScript",
    forks_count: 5,
    topics: ["jobs", "interview", "tools"]
  },
  {
    id: 3,
    name: "gaming-automation",
    full_name: "techiekamal21/gaming-automation",
    private: false,
    html_url: "https://github.com/techiekamal21",
    description: "Automation scripts for gaming and daily tasks.",
    fork: false,
    url: "",
    created_at: "2023-03-01",
    updated_at: "2023-10-01",
    homepage: "https://codebyart.com",
    stargazers_count: 45,
    watchers_count: 45,
    language: "Python",
    forks_count: 8,
    topics: ["automation", "gaming", "python"]
  }
];

export const fetchUserProfile = async (): Promise<GitHubUser> => {
  try {
    const response = await fetch(`${BASE_URL}/users/${USERNAME}`);
    if (!response.ok) {
      if (response.status === 403 || response.status === 404) {
        console.warn('GitHub API rate limited or user not found, using mock data.');
        return MOCK_USER;
      }
      throw new Error(`Error fetching user: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return MOCK_USER;
  }
};

export const fetchUserRepos = async (): Promise<GitHubRepo[]> => {
  try {
    // Increased per_page to 100 to get better stats accuracy
    const response = await fetch(`${BASE_URL}/users/${USERNAME}/repos?sort=updated&per_page=100`);
    if (!response.ok) {
       if (response.status === 403 || response.status === 404) {
        return MOCK_REPOS;
      }
      throw new Error(`Error fetching repos: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return MOCK_REPOS;
  }
};

export const fetchGitHubEvents = async (): Promise<GitHubEvent[]> => {
  try {
    const response = await fetch(`${BASE_URL}/users/${USERNAME}/events/public?per_page=10`);
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};
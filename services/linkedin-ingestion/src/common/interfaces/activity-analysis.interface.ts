export interface Post {
  id: string;
  content: string;
  date: string;
  likes: number;
  comments: number;
  shares: number;
  mediaType: 'text' | 'image' | 'video' | 'article';
}

export interface ContentMix {
  text: number;
  image: number;
  video: number;
  article: number;
}

export interface AvgEngagement {
  likes: number;
  comments: number;
  shares: number;
}

export interface ActivityAnalysis {
  postFrequency: string;
  avgEngagement: AvgEngagement;
  topTopics: string[];
  bestPostingTimes: string[];
  contentMix: ContentMix;
  growthTrend: string;
  recommendations: string[];
}

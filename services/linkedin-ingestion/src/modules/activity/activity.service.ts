import { Injectable, Logger } from '@nestjs/common';
import {
  Post,
  ActivityAnalysis,
  ContentMix,
  AvgEngagement,
} from '../../common/interfaces';

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  async analyzePostingActivity(posts: Post[]): Promise<ActivityAnalysis> {
    this.logger.log(`Analyzing ${posts.length} posts`);

    const postFrequency = this.calculatePostFrequency(posts);
    const avgEngagement = this.calculateAvgEngagement(posts);
    const topTopics = this.extractTopTopics(posts);
    const bestPostingTimes = this.determineBestPostingTimes(posts);
    const contentMix = this.calculateContentMix(posts);
    const growthTrend = this.assessGrowthTrend(posts);
    const recommendations = this.generateRecommendations(
      posts,
      postFrequency,
      contentMix,
      avgEngagement,
    );

    return {
      postFrequency,
      avgEngagement,
      topTopics,
      bestPostingTimes,
      contentMix,
      growthTrend,
      recommendations,
    };
  }

  private calculatePostFrequency(posts: Post[]): string {
    if (posts.length === 0) return 'No posts';

    const dates = posts
      .map((p) => new Date(p.date))
      .filter((d) => !isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());

    if (dates.length < 2) return 'Insufficient data';

    const firstDate = dates[0]!;
    const lastDate = dates[dates.length - 1]!;
    const daySpan = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
    const weekSpan = daySpan / 7;
    const postsPerWeek = posts.length / weekSpan;

    if (postsPerWeek >= 5) return 'Daily';
    if (postsPerWeek >= 3) return '3-5 times per week';
    if (postsPerWeek >= 1) return '1-2 times per week';
    if (postsPerWeek >= 0.25) return 'A few times per month';
    return 'Rarely';
  }

  private calculateAvgEngagement(posts: Post[]): AvgEngagement {
    if (posts.length === 0) {
      return { likes: 0, comments: 0, shares: 0 };
    }

    const totals = posts.reduce(
      (acc, post) => ({
        likes: acc.likes + post.likes,
        comments: acc.comments + post.comments,
        shares: acc.shares + post.shares,
      }),
      { likes: 0, comments: 0, shares: 0 },
    );

    return {
      likes: Math.round(totals.likes / posts.length),
      comments: Math.round(totals.comments / posts.length),
      shares: Math.round(totals.shares / posts.length),
    };
  }

  private extractTopTopics(posts: Post[]): string[] {
    const wordFrequency = new Map<string, number>();
    const stopWords = new Set([
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
      'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'between', 'and', 'but', 'or',
      'not', 'no', 'nor', 'so', 'yet', 'both', 'either', 'neither', 'each',
      'every', 'all', 'any', 'few', 'more', 'most', 'other', 'some', 'such',
      'than', 'too', 'very', 'just', 'about', 'this', 'that', 'these', 'those',
      'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'it', 'they',
      'them', 'its', 'his', 'her', 'their', 'what', 'which', 'who', 'whom',
    ]);

    for (const post of posts) {
      const words = post.content
        .toLowerCase()
        .replace(/[^a-z0-9\s#]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 3 && !stopWords.has(w));

      for (const word of words) {
        wordFrequency.set(word, (wordFrequency.get(word) ?? 0) + 1);
      }
    }

    return [...wordFrequency.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  private determineBestPostingTimes(posts: Post[]): string[] {
    const hourEngagement = new Map<number, { total: number; count: number }>();

    for (const post of posts) {
      const date = new Date(post.date);
      if (isNaN(date.getTime())) continue;

      const hour = date.getHours();
      const engagement = post.likes + post.comments * 2 + post.shares * 3;
      const existing = hourEngagement.get(hour) ?? { total: 0, count: 0 };

      hourEngagement.set(hour, {
        total: existing.total + engagement,
        count: existing.count + 1,
      });
    }

    const hourAverages = [...hourEngagement.entries()]
      .map(([hour, data]) => ({
        hour,
        avg: data.total / data.count,
      }))
      .sort((a, b) => b.avg - a.avg);

    return hourAverages.slice(0, 3).map((entry) => {
      const period = entry.hour >= 12 ? 'PM' : 'AM';
      const displayHour = entry.hour === 0 ? 12 : entry.hour > 12 ? entry.hour - 12 : entry.hour;
      return `${displayHour}:00 ${period}`;
    });
  }

  private calculateContentMix(posts: Post[]): ContentMix {
    if (posts.length === 0) {
      return { text: 0, image: 0, video: 0, article: 0 };
    }

    const counts = posts.reduce(
      (acc, post) => {
        acc[post.mediaType] = (acc[post.mediaType] ?? 0) + 1;
        return acc;
      },
      { text: 0, image: 0, video: 0, article: 0 } as ContentMix,
    );

    const total = posts.length;
    return {
      text: Math.round((counts.text / total) * 100),
      image: Math.round((counts.image / total) * 100),
      video: Math.round((counts.video / total) * 100),
      article: Math.round((counts.article / total) * 100),
    };
  }

  private assessGrowthTrend(posts: Post[]): string {
    if (posts.length < 4) return 'Insufficient data for trend analysis';

    const sorted = [...posts]
      .filter((p) => !isNaN(new Date(p.date).getTime()))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (sorted.length < 4) return 'Insufficient data for trend analysis';

    const midpoint = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, midpoint);
    const secondHalf = sorted.slice(midpoint);

    const avgFirst = this.averageEngagement(firstHalf);
    const avgSecond = this.averageEngagement(secondHalf);

    const changePercent = avgFirst > 0
      ? ((avgSecond - avgFirst) / avgFirst) * 100
      : avgSecond > 0 ? 100 : 0;

    if (changePercent > 20) return 'Strong upward trend';
    if (changePercent > 5) return 'Moderate upward trend';
    if (changePercent > -5) return 'Stable';
    if (changePercent > -20) return 'Moderate downward trend';
    return 'Declining engagement';
  }

  private averageEngagement(posts: Post[]): number {
    if (posts.length === 0) return 0;
    const total = posts.reduce(
      (sum, p) => sum + p.likes + p.comments * 2 + p.shares * 3,
      0,
    );
    return total / posts.length;
  }

  private generateRecommendations(
    posts: Post[],
    frequency: string,
    mix: ContentMix,
    engagement: AvgEngagement,
  ): string[] {
    const recommendations: string[] = [];

    if (posts.length === 0) {
      recommendations.push('Start posting regularly to build your LinkedIn presence');
      recommendations.push('Aim for at least 2-3 posts per week for optimal visibility');
      return recommendations;
    }

    if (frequency === 'Rarely' || frequency === 'A few times per month') {
      recommendations.push('Increase posting frequency to at least 2-3 times per week for better reach');
    }

    if (mix.video < 10) {
      recommendations.push('Consider adding video content — video posts typically get 5x more engagement on LinkedIn');
    }

    if (mix.article < 5) {
      recommendations.push('Write long-form articles to establish thought leadership in your industry');
    }

    if (mix.text > 70) {
      recommendations.push('Diversify your content mix — add images, carousels, or polls to boost engagement');
    }

    if (engagement.comments < 5) {
      recommendations.push('End posts with a question to encourage more comments and discussion');
    }

    if (engagement.shares < 2) {
      recommendations.push('Share actionable insights and frameworks that people will want to reshare');
    }

    recommendations.push('Engage with comments on your posts within the first hour to boost algorithmic reach');

    return recommendations;
  }
}

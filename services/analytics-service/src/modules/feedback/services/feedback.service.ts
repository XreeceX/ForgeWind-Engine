import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  UserFeedback,
  FeedbackAnalysis,
  SentimentBreakdown,
} from '../../../common/interfaces';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);
  private readonly feedbackStore = new Map<string, UserFeedback[]>();

  async collectFeedback(
    userId: string,
    featureId: string,
    rating: number,
    comment: string | null,
    context: Record<string, unknown> = {},
  ): Promise<UserFeedback> {
    const feedback: UserFeedback = {
      id: randomUUID(),
      userId,
      featureId,
      rating,
      comment,
      context,
      createdAt: new Date(),
    };

    const userFeedback = this.feedbackStore.get(userId) ?? [];
    userFeedback.push(feedback);
    this.feedbackStore.set(userId, userFeedback);

    this.logger.log(
      `Collected feedback from user ${userId} for feature ${featureId}: rating=${rating}`,
    );

    return feedback;
  }

  async analyzeFeedback(userId: string): Promise<FeedbackAnalysis> {
    const feedbacks = this.feedbackStore.get(userId) ?? [];

    if (feedbacks.length === 0) {
      return {
        averageRating: 0,
        sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
        topIssues: [],
        topPraises: [],
        featureRatings: {},
        suggestions: [],
      };
    }

    const averageRating = this.calculateAverageRating(feedbacks);
    const sentimentBreakdown = this.analyzeSentiment(feedbacks);
    const featureRatings = this.calculateFeatureRatings(feedbacks);
    const { topIssues, topPraises, suggestions } =
      this.analyzeComments(feedbacks);

    return {
      averageRating,
      sentimentBreakdown,
      topIssues,
      topPraises,
      featureRatings,
      suggestions,
    };
  }

  private calculateAverageRating(feedbacks: UserFeedback[]): number {
    const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
    return Math.round((sum / feedbacks.length) * 10) / 10;
  }

  private analyzeSentiment(feedbacks: UserFeedback[]): SentimentBreakdown {
    let positive = 0;
    let neutral = 0;
    let negative = 0;

    for (const feedback of feedbacks) {
      if (feedback.rating >= 4) positive++;
      else if (feedback.rating === 3) neutral++;
      else negative++;
    }

    const total = feedbacks.length;
    return {
      positive: Math.round((positive / total) * 100),
      neutral: Math.round((neutral / total) * 100),
      negative: Math.round((negative / total) * 100),
    };
  }

  private calculateFeatureRatings(
    feedbacks: UserFeedback[],
  ): Record<string, number> {
    const featureGroups = new Map<string, number[]>();

    for (const feedback of feedbacks) {
      const ratings = featureGroups.get(feedback.featureId) ?? [];
      ratings.push(feedback.rating);
      featureGroups.set(feedback.featureId, ratings);
    }

    const result: Record<string, number> = {};
    for (const [featureId, ratings] of featureGroups) {
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      result[featureId] = Math.round(avg * 10) / 10;
    }

    return result;
  }

  private analyzeComments(feedbacks: UserFeedback[]): {
    topIssues: string[];
    topPraises: string[];
    suggestions: string[];
  } {
    const issueKeywords = [
      'slow',
      'bug',
      'broken',
      'error',
      'crash',
      'confusing',
      'difficult',
      'missing',
    ];
    const praiseKeywords = [
      'great',
      'love',
      'excellent',
      'helpful',
      'fast',
      'easy',
      'intuitive',
      'amazing',
    ];
    const suggestionKeywords = [
      'should',
      'could',
      'would be nice',
      'suggest',
      'wish',
      'please add',
      'improve',
    ];

    const issues: string[] = [];
    const praises: string[] = [];
    const suggestions: string[] = [];

    for (const feedback of feedbacks) {
      if (!feedback.comment) continue;
      const lowerComment = feedback.comment.toLowerCase();

      if (issueKeywords.some((kw) => lowerComment.includes(kw))) {
        issues.push(feedback.comment);
      }
      if (praiseKeywords.some((kw) => lowerComment.includes(kw))) {
        praises.push(feedback.comment);
      }
      if (suggestionKeywords.some((kw) => lowerComment.includes(kw))) {
        suggestions.push(feedback.comment);
      }
    }

    return {
      topIssues: issues.slice(0, 10),
      topPraises: praises.slice(0, 10),
      suggestions: suggestions.slice(0, 10),
    };
  }
}

// External API Integrations for Content
import { Lesson } from '@/types';

export interface ExternalContent {
  title: string;
  content: string;
  source: string;
  category: string;
  publishedAt: string;
  url?: string;
}

class ContentApiService {
  // Hacker News API
  async getHackerNewsStories(): Promise<ExternalContent[]> {
    try {
      const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
      const storyIds = await response.json();

      const stories = await Promise.all(
        storyIds.slice(0, 10).map(async (id: number) => {
          const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
          const story = await storyResponse.json();

          return {
            title: story.title,
            content: story.text || story.title,
            source: 'Hacker News',
            category: 'tech',
            publishedAt: new Date(story.time * 1000).toISOString(),
            url: story.url,
          };
        })
      );

      return stories.filter(Boolean);
    } catch (error) {
      console.error('Hacker News API error:', error);
      return [];
    }
  }

  // Reddit API
  async getRedditPosts(subreddit: string = 'technology'): Promise<ExternalContent[]> {
    try {
      const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=10`);
      const data = await response.json();

      return data.data.children.map((post: any) => ({
        title: post.data.title,
        content: post.data.selftext || post.data.title,
        source: `Reddit r/${subreddit}`,
        category: this.mapRedditCategory(subreddit),
        publishedAt: new Date(post.data.created_utc * 1000).toISOString(),
        url: `https://reddit.com${post.data.permalink}`,
      }));
    } catch (error) {
      console.error('Reddit API error:', error);
      return [];
    }
  }

  // Financial Modeling Prep API
  async getMarketNews(): Promise<ExternalContent[]> {
    const apiKey = process.env.EXPO_PUBLIC_FMP_API_KEY;
    if (!apiKey) return [];

    try {
      const response = await fetch(`https://financialmodelingprep.com/api/v3/stock_news?apikey=${apiKey}&limit=10`);
      const news = await response.json();

      return news.map((item: any) => ({
        title: item.title,
        content: item.text,
        source: 'Financial Modeling Prep',
        category: 'finance',
        publishedAt: item.publishedDate,
        url: item.url,
      }));
    } catch (error) {
      console.error('FMP API error:', error);
      return [];
    }
  }

  // RSS Feed Parser
  async parseRSSFeed(feedUrl: string): Promise<ExternalContent[]> {
    try {
      const response = await fetch(`https://api.rss2json.com/api.json?rss_url=${encodeURIComponent(feedUrl)}`);
      const data = await response.json();

      return data.items.map((item: any) => ({
        title: item.title,
        content: item.description || item.content,
        source: data.feed.title,
        category: this.rssToCategory(data.feed.title),
        publishedAt: item.pubDate,
        url: item.link,
      }));
    } catch (error) {
      console.error('RSS parsing error:', error);
      return [];
    }
  }

  // Helper methods
  private mapRedditCategory(subreddit: string): string {
    const categoryMap: Record<string, string> = {
      'technology': 'tech',
      'programming': 'tech',
      'investing': 'finance',
      'personalfinance': 'finance',
      'news': 'events',
      'worldnews': 'events',
    };
    return categoryMap[subreddit] || 'culture';
  }

  private rssToCategory(feedTitle: string): string {
    if (feedTitle.toLowerCase().includes('tech')) return 'tech';
    if (feedTitle.toLowerCase().includes('finance')) return 'finance';
    if (feedTitle.toLowerCase().includes('news')) return 'events';
    return 'culture';
  }

  // Main content aggregation method
  async getAllContent(): Promise<ExternalContent[]> {
    const [hackerNews, reddit, marketNews] = await Promise.all([
      this.getHackerNewsStories(),
      this.getRedditPosts('technology'),
      this.getMarketNews(),
    ]);

    return [...hackerNews, ...reddit, ...marketNews]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 50);
  }
}

export const contentApi = new ContentApiService();
export default contentApi;

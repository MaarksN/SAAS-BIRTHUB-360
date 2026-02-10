export interface SocialPost {
  id: string;
  platform: 'linkedin' | 'twitter';
  content: string;
  scheduledTime: Date;
}

export class ContentScheduler {
  private queue: SocialPost[] = [];

  schedule(post: SocialPost) {
    this.queue.push(post);
    console.log(`Scheduled post for ${post.platform} at ${post.scheduledTime}`);
  }

  getQueue(): SocialPost[] {
    return this.queue;
  }
}

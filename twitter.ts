export interface Tweet {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
}

export class TwitterMonitor {
  private keywords: string[] = [];

  addKeyword(keyword: string) {
    this.keywords.push(keyword);
  }

  async listen(): Promise<Tweet[]> {
    console.log(`Listening for keywords: ${this.keywords.join(", ")}`);
    // Mock stream
    return [
      {
        id: "1",
        content: "Looking for a new CRM tool #sales",
        author: "@sales_guru",
        timestamp: new Date()
      }
    ];
  }
}

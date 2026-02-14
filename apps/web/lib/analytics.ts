type EventProperties = Record<string, any>;

interface AnalyticsProvider {
  track(eventName: string, properties?: EventProperties): void;
  identify(userId: string, traits?: EventProperties): void;
  page(category: string, name: string, properties?: EventProperties): void;
}

// Basic console logger as a placeholder
class ConsoleAnalytics implements AnalyticsProvider {
  track(eventName: string, properties?: EventProperties) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] Track: ${eventName}`, properties);
    }
  }

  identify(userId: string, traits?: EventProperties) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] Identify: ${userId}`, traits);
    }
  }

  page(category: string, name: string, properties?: EventProperties) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] Page: ${category} ${name}`, properties);
    }
  }
}

// Future implementation: PostHogAnalytics
// class PostHogAnalytics implements AnalyticsProvider { ... }

const provider: AnalyticsProvider = new ConsoleAnalytics();

export const analytics = {
  track: (eventName: string, properties?: EventProperties) => {
    try {
      provider.track(eventName, properties);
    } catch (e) {
      console.error('Analytics Error:', e);
    }
  },
  identify: (userId: string, traits?: EventProperties) => {
    try {
      provider.identify(userId, traits);
    } catch (e) {
      console.error('Analytics Error:', e);
    }
  },
  page: (category: string, name: string, properties?: EventProperties) => {
    try {
      provider.page(category, name, properties);
    } catch (e) {
      console.error('Analytics Error:', e);
    }
  },
};

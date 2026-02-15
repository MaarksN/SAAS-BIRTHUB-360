import { logger } from '@salesos/core';
import * as cheerio from 'cheerio';
import { Browser } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import { ProxyManager } from './proxy-manager';

puppeteer.use(StealthPlugin());

export class ScraperEngine {
  private browser: Browser | null = null;
  private proxyManager: ProxyManager;

  constructor() {
    this.proxyManager = new ProxyManager();
  }

  async init() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
        // executablePath: process.env.CHROME_BIN || undefined,
      });
      logger.info('Browser launched');
    }
  }

  async scrape(url: string) {
    if (!this.browser) await this.init();

    const context = await this.browser!.createIncognitoBrowserContext();
    const page = await context.newPage();

    // Proxy handling would go here (e.g. page.authenticate if using proxy with auth)
    const proxy = this.proxyManager.getNextProxy();
    if (proxy) {
       // Setup proxy (simplified)
       logger.info({ url, proxy }, 'Using proxy');
    }

    // Resource Blocking
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (['image', 'media', 'font', 'stylesheet', 'other'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    try {
      logger.debug({ url }, 'Navigating to URL');
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

      const content = await page.content();

      // Soft Block Detection
      if (this.isBlocked(content)) {
        logger.warn({ url }, 'Soft Block Detected');
        if (proxy) this.proxyManager.reportFailure(proxy);
        throw new Error('Soft Block Detected');
      }

      // Parsing with Cheerio
      const $ = cheerio.load(content);
      const title = $('title').text();
      // Extract more data based on strategy...

      return { title, html: content };
    } catch (error) {
      logger.error({ url, error }, 'Scraping failed');
      throw error;
    } finally {
      await page.close();
      await context.close();
    }
  }

  isBlocked(html: string): boolean {
    return (
      html.includes('Verify you are human') ||
      html.includes('Security Challenge') ||
      html.includes('Captcha')
    );
  }

  async close() {
    if (this.browser) await this.browser.close();
  }
}

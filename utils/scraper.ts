import * as cheerio from 'cheerio';

export async function scrapeUrl(url: string): Promise<string> {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);
        
        // Remove script tags, style tags, and comments
        $('script').remove();
        $('style').remove();
        $('comments').remove();
        
        // Get text content
        const text = $('body').text()
            .replace(/\s+/g, ' ')
            .trim();
            
        return text;
    } catch (error) {
        console.error('Error scraping URL:', error);
        throw new Error('Failed to scrape URL');
    }
} 

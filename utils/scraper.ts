import axios from 'axios';
import * as cheerio from 'cheerio';

// Get the base URL from environment variable or default to localhost in development
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export async function scrapeWebpage(url: string) {
  try {
    console.log('\n🔍 Starting scrape for URL:', url);
    
    const proxyUrl = `${BASE_URL}/api/proxy?url=${encodeURIComponent(url)}`;
    console.log('🔄 Proxy URL:', proxyUrl);
    
    const response = await axios.get(proxyUrl);
    console.log('📥 Response received, length:', response.data.length);
    console.log('📄 First 500 chars of response:', response.data.substring(0, 500));

    const $ = cheerio.load(response.data);
    
    // Remove non-content elements
    $('script, style, nav, header, footer, [role="navigation"]').remove();

    // Get all text content from the main content area
    const mainContent = $('main, article, [role="main"], .content, #content, .main')
      .map((_, el) => {
        // Get text from all nested elements
        return $(el).find('*').map((_, child) => $(child).text()).get().join(' ');
      })
      .get()
      .join('\n');

    // If no main content found, get text from all paragraphs and headings
    const fallbackContent = !mainContent ? 
      $('p, h1, h2, h3, h4, h5, h6, article, section')
        .map((_, el) => $(el).text())
        .get()
        .join('\n') 
      : '';

    const content = (mainContent || fallbackContent)
      .replace(/\s+/g, ' ')
      .trim();

    console.log('\n📝 Final content length:', content.length);
    console.log('📝 Content preview:', content.substring(0, 200));

    return {
      url,
      content,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('\n💥 Scraping error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      url,
      stack: error instanceof Error ? error.stack : undefined
    });
    return null;
  }
} 
import { scrapeWebpage } from './scraper';

interface PageContent {
  url: string;
  content: string;
  timestamp: string;
}

class DynamicKnowledgeBase {
  private urlMappings = [
    {
      url: 'https://www.westwing.com/sustainability/faq/',
      description: 'Information about our sustainability initiatives, environmental impact, and eco-friendly practices',
      keywords: [
        'sustainability', 'eco', 'environment', 'green', 'sustainable',
        'environmental', 'eco-friendly', 'carbon', 'emissions', 'climate',
        'faq', 'frequently asked questions'
      ]
    },
    {
      url: 'https://www.westwing.com/contact/',
      description: 'Contact information and support options for reaching Westwing customer service',
      keywords: [
        'contact', 'reach', 'email', 'phone', 'support', 'help',
        'contact form', 'contact us', 'get in touch', 'customer service',
        'support team', 'helpdesk', 'assistance'
      ]
    },
    {
      url: 'https://www.westwing.com/company/#key-figures',
      description: 'Key business metrics, company statistics, and performance indicators',
      keywords: [
        'figures', 'statistics', 'numbers', 'growth', 'company',
        'business', 'performance', 'metrics', 'data', 'results'
      ]
    },
    {
      url: 'https://www.westwing.com/countries/',
      description: 'Information about countries we operate in and international shipping options',
      keywords: [
        'countries', 'locations', 'regions', 'where', 'available', 'ship', 'shipping countries',
        'deliver', 'delivery', 'international', 'global', 'local', 'website', 'store',
        'where do you operate', 'where do you deliver', 'where can i buy'
      ]
    }
  ];

  getUrlMappings() {
    return this.urlMappings;
  }

  async getContent(topic: string): Promise<PageContent | null> {
    console.log('\n🔍 Looking up content for topic:', topic);
    
    // Try to find matches with multiple keywords from the topic
    const words = topic.toLowerCase().split(/\s+/);
    
    const matchingMapping = this.urlMappings.find(mapping => {
      const urlWords = mapping.url.toLowerCase().split(/[/\-#]/).filter(Boolean);
      return words.some(word => 
        mapping.keywords.some(keyword => keyword.includes(word) || word.includes(keyword)) ||
        urlWords.some(urlWord => urlWord.includes(word) || word.includes(urlWord))
      );
    });
    
    if (!matchingMapping) {
      console.log('❌ No matching URL found for topic:', topic);
      return null;
    }

    const url = matchingMapping.url;
    console.log('✅ Found matching URL:', url);

    console.log('🔄 Fetching fresh content for:', url);
    const content = await scrapeWebpage(url);
    if (content) {
      return content;
    }

    return null;
  }
}

export const knowledgeBase = new DynamicKnowledgeBase(); 
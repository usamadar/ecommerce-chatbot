# Shopify Chat Agent

A Next.js application that provides an AI-powered chat interface for Shopify stores, leveraging OpenAI for natural language processing and Pinecone for efficient vector search capabilities.

## Features

- 🤖 AI-powered chat interface using OpenAI
- 🛍️ Seamless Shopify integration
- 🔍 Vector search capabilities with Pinecone
- 📄 Document management and processing
- 🔐 Admin dashboard
- 💬 Real-time chat functionality

## Prerequisites

Before you begin, ensure you have:
- Node.js 18.x or higher
- npm or yarn package manager
- A Shopify store with API access
- OpenAI API key
- Pinecone account and API key

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd shopify-chat-agent
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with the following variables:
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Shopify Configuration
SHOPIFY_SHOP_DOMAIN=your-shop-name.myshopify.com
SHOPIFY_ACCESS_TOKEN=your_shopify_access_token

# Application URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_pinecone_index_name
```

## Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
shopify-chat-agent/
├── app/                    # Next.js 13+ App Router
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   │   ├── chat/         # Chat endpoints
│   │   ├── documents/    # Document management
│   │   └── urls/         # URL processing
│   └── page.tsx          # Main chat interface
├── components/            # React components
│   ├── admin/            # Admin components
│   └── ui/               # Shared UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── public/               # Static assets
├── services/             # External service integrations
├── types/                # TypeScript definitions
└── utils/                # Helper functions
```

## Key Components

### Chat Interface
- Located at the root route `/`
- Provides AI-powered responses to customer queries
- Integrates with Shopify for order and product information

### Admin Dashboard
- Access via `/admin`
- Manage chat content and responses
- Configure system settings
- Monitor chat interactions

### API Routes
- `/api/chat`: Handles chat interactions and AI processing
- `/api/documents`: Manages document storage and retrieval
- `/api/urls`: Processes URLs and web scraping

## Configuration

### OpenAI
- Requires an API key from OpenAI
- Used for natural language processing and response generation

### Shopify
- Requires shop domain and access token
- Enables access to product and order information
- Set up appropriate permissions in Shopify admin

### Pinecone
- Vector database for efficient similarity search
- Requires API key and index name
- Used for storing and retrieving relevant chat contexts

## Best Practices

1. Keep your environment variables secure and never commit them to version control
2. Regularly update dependencies for security patches
3. Monitor API usage to stay within rate limits
4. Regularly backup your Pinecone index
5. Test thoroughly in development before deploying to production

## Deployment

1. Build the application:
```bash
npm run build
# or
yarn build
```

2. Start the production server:
```bash
npm start
# or
yarn start
```

## Troubleshooting

Common issues and solutions:

1. **API Key Issues**
   - Ensure all API keys are correctly set in `.env.local`
   - Verify API key permissions and quotas

2. **Shopify Integration**
   - Confirm Shopify access token has required permissions
   - Check Shopify API version compatibility

3. **Pinecone Connection**
   - Verify index name matches your Pinecone setup
   - Ensure vector dimensions match your configuration

## Support

For issues and feature requests, please create an issue in the repository's issue tracker.

## License

This project is proprietary and confidential. Unauthorized copying, modification, distribution, or use is strictly prohibited.

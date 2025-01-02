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

## Setup

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/shopify-chat-agent.git
    cd shopify-chat-agent
    ```

2. Install dependencies:
    ```bash
    npm install
    ```
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

# Zendesk Configuration
ZENDESK_SUBDOMAIN=your_zendesk_subdomain
ZENDESK_API_TOKEN=your_zendesk_api_token
ZENDESK_EMAIL=your_zendesk_email
```

## Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Running the Project

1. Start the development server:
    ```bash
    npm run dev
    ```

2. Open your browser and navigate to `http://localhost:3000` to see the application running.

## Project Structure

```
shopify-chat-agent/
├── .next/                  # Next.js build output
├── app/                    # Next.js 13+ App Router
│   ├── api/                # API routes
│   ├── admin/              # Admin pages
│   ├── components/         # React components
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utility functions and libraries
│   ├── pages/              # Page components
│   ├── styles/             # Global styles
│   ├── utils/              # Utility functions
├── node_modules/           # Node.js modules
├── public/                 # Public assets
├── .env.local              # Environment variables
├── .gitignore              # Git ignore file
├── README.md               # Project README file
├── package.json            # NPM package configuration
├── tsconfig.json           # TypeScript configuration
└── ...                     # Other project files
```

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

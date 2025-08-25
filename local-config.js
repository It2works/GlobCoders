// Local Development Configuration
// Copy this to .env.local for local development

export const LOCAL_CONFIG = {
    API_BASE_URL: 'http://localhost:5000',
    STRIPE_PUBLISHABLE_KEY: 'your_stripe_test_key_here',
    APP_ENV: 'development'
};

// Instructions:
// 1. Create a file called .env.local in your frontend root
// 2. Add: VITE_API_BASE_URL=http://localhost:5000
// 3. Add: VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_test_key_here

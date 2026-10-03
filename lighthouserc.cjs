/** @type {import('lighthouse').Flags} */
module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.85 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        'render-blocking-resources': 'warn',
        'uses-long-cache-ttl': 'warn',
        'uses-text-compression': 'warn'
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};

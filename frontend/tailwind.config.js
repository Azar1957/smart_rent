/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,js,jsx,mdx}'],
  theme: {
    extend: {
      colors: {
        rausch: {
          DEFAULT: '#ff385c',
          coral: '#ff385c',
          deep: '#e00b41',
        },
        // Бэкомпат: старые страницы (login/register/dashboard) используют `bg-brand-*`.
        // Маппим на rausch, чтобы единообразно остаться в Airbnb-палитре.
        brand: {
          50: '#fff1f4',
          100: '#ffe1e8',
          500: '#ff385c',
          600: '#ff385c',
          700: '#e00b41',
          900: '#7a0023',
        },
        carbon: '#222222',
        slatex: '#6a6a6a',
        silver: '#c1c1c1',
        stone: '#b0b0b0',
        pebble: '#dddddd',
        mist: '#ebebeb',
        fog: '#f7f7f7',
        cloud: '#ffffff',
      },
      fontFamily: {
        sans: [
          '"Airbnb Cereal VF"',
          'var(--font-inter)',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      fontSize: {
        caption: ['11px', { lineHeight: '1.29', letterSpacing: '0.44px' }],
        body: ['14px', { lineHeight: '1.43', letterSpacing: '-0.13px' }],
        'heading-sm': ['20px', { lineHeight: '1.25', letterSpacing: '-0.18px' }],
        heading: ['22px', { lineHeight: '1.23', letterSpacing: '-0.2px' }],
        display: ['28px', { lineHeight: '1.18', letterSpacing: '-0.56px' }],
      },
      borderRadius: {
        badge: '4px',
        button: '8px',
        input: '14px',
        card: '20px',
        pill: '32px',
      },
      boxShadow: {
        subtle: 'rgba(0, 0, 0, 0.02) 0px 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 2px 6px 0px, rgba(0, 0, 0, 0.1) 0px 4px 8px 0px',
        'subtle-2': 'rgba(0, 0, 0, 0.02) 0px 0px 0px 1px, rgba(0, 0, 0, 0.16) 0px 2px 4px 0px',
        badge: '0 2px 6px rgba(0, 0, 0, 0.25)',
      },
      maxWidth: {
        page: '1760px',
      },
    },
  },
  plugins: [],
};

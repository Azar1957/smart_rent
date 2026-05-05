/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,js,jsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Hyer Aviation палитра (главная для бренда).
        obsidian: '#000d10',
        canvas: '#ffffff',
        mistx: '#8e8e95',
        sienna: {
          DEFAULT: '#bc7155',
          deep: '#a55d44',
        },
        // Совместимость с витриной Airbnb (карточки и т.п.).
        rausch: {
          DEFAULT: '#bc7155',
          coral: '#bc7155',
          deep: '#a55d44',
        },
        brand: {
          50: '#f4ece8',
          100: '#e9d7cf',
          500: '#bc7155',
          600: '#bc7155',
          700: '#a55d44',
          900: '#5b2f1f',
        },
        carbon: '#000d10',
        slatex: '#6a6a6a',
        silver: '#c1c1c1',
        stone: '#b0b0b0',
        pebble: '#dddddd',
        mist: '#ebebeb',
        fog: '#f7f7f7',
        cloud: '#ffffff',
      },
      fontFamily: {
        // HelveticaNowDisplay (substitute: Manrope для близости к Helvetica Now).
        sans: [
          '"HelveticaNowDisplay"',
          'var(--font-display)',
          'Manrope',
          'Helvetica',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        // Hyer Aviation шкала.
        'body-sm': ['17px', { lineHeight: '1.61', letterSpacing: '0.17px' }],
        body: ['17px', { lineHeight: '1.61', letterSpacing: '0.17px' }],
        subheading: ['20px', { lineHeight: '1.2', letterSpacing: '0.2px' }],
        'heading-sm': ['30px', { lineHeight: '1.1', letterSpacing: '-0.3px' }],
        heading: ['52px', { lineHeight: '1.09', letterSpacing: '-0.52px' }],
        'heading-lg': ['63px', { lineHeight: '0.91', letterSpacing: '-0.63px' }],
        display: ['96px', { lineHeight: '0.85', letterSpacing: '-2.5px' }],
        'display-xl': ['187px', { lineHeight: '0.8', letterSpacing: '-3.74px' }],
        // Каноничные Airbnb-токены (для карточек витрины).
        caption: ['11px', { lineHeight: '1.29', letterSpacing: '0.44px' }],
      },
      borderRadius: {
        badge: '4px',
        // Hyer pill: 1000px.
        button: '1000px',
        input: '1000px',
        pill: '1000px',
        link: '1000px',
        full2: '1000px',
        // Карточки/панели — крупные скругления Hyer (45px), под витрину тоже подходит.
        card: '20px',
        panel: '45px',
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

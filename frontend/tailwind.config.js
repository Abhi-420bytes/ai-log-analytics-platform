/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark: { 950:'#020817',900:'#0D1117',800:'#161B22',700:'#21262D',600:'#30363D' },
      },
      animation: {
        'pulse-dot': 'pulse 1.5s cubic-bezier(0.4,0,0.6,1) infinite',
        'slide-up':  'slideUp 0.4s ease-out',
        'fade-in':   'fadeIn 0.5s ease-out',
      },
      keyframes: {
        slideUp:  { '0%':{ transform:'translateY(8px)',opacity:0 }, '100%':{ transform:'translateY(0)',opacity:1 } },
        fadeIn:   { '0%':{ opacity:0 }, '100%':{ opacity:1 } },
      }
    }
  },
  plugins: []
}

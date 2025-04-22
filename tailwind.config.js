module.exports = {
    darkMode: 'class', // 👈 this is important!
    content: [
      './src/**/*.{js,ts,jsx,tsx}',
      './app/**/*.{js,ts,jsx,tsx}',
      
    ],
    theme: {
      extend: {
        colors: {
            primary: 'var(--primary)',
            secondary: 'var(--secondary)',
            gradient: 'var(--gradient)',
        }
      },
    },
    plugins: [require('@tailwindcss/typography')],
  }
  
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Màu tím cũ của bạn
        'myjob-purple': '#441da0',

        // === BƯỚC 1: THÊM 2 MÀU TÍM ĐEN MỚI ===
        // Đặt tên theo ý nghĩa để dễ sử dụng
        'brand-dark': '#2c1e5d',    // Màu tím đậm
        'brand-darkest': '#1a1138', // Màu tím gần như đen
      },
      // === BƯỚC 2: ĐỊNH NGHĨA GRADIENT MỚI ===
      backgroundImage: {
        // Đặt tên cho gradient để gọi bằng class `bg-gradient-brand`
        'gradient-brand': "linear-gradient(to right, theme('colors.brand-dark'), theme('colors.brand-darkest'))",
      },
      keyframes: {
        'fade-in-down': {
            '0%': { opacity: '0', transform: 'translateY(-10px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        // Thêm animation để có thể dùng class `animate-fade-in-down`
        'fade-in-down': 'fade-in-down 0.3s ease-out'
      }
    },
  },
  plugins: [],
}
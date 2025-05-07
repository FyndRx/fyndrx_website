# FyndRX Website

A modern healthcare accessibility platform built with Vue.js 3, TypeScript, and Tailwind CSS.

## Features

- Modern and responsive UI with Tailwind CSS
- Type-safe development with TypeScript
- State management with Pinia
- Client-side routing with Vue Router
- Dark mode support
- Mobile-first design
- Authentication system
- Appointment scheduling
- Prescription management
- Healthcare provider search

## Tech Stack

- Vue.js 3
- TypeScript
- Tailwind CSS
- Pinia
- Vue Router
- Axios
- Vite

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Project Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/fyndrx_website.git
   cd fyndrx_website
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Build for production:
   ```bash
   npm run build
   # or
   yarn build
   ```

## Project Structure

```
src/
├── assets/         # Static assets
├── components/     # Reusable Vue components
├── controllers/    # Business logic controllers
├── layouts/        # Layout components
├── models/         # TypeScript interfaces
├── router/         # Vue Router configuration
├── services/       # API and utility services
├── store/          # Pinia stores
├── styles/         # Global styles
└── views/          # Page components
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

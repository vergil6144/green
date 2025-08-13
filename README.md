# Go Green - Sustainable Living App

A Next.js application that helps users classify waste and track their environmental impact through a social credit system.

## Features

- **Waste Classification**: Use your camera to classify different types of waste
- **Social Credit System**: Earn points for sustainable actions
- **User Authentication**: Secure sign up/sign in system using IndexedDB and localStorage
- **Protected Routes**: Social credit features require authentication
- **Responsive Design**: Modern UI with Tailwind CSS

## Authentication System

The app uses a client-side authentication system with:

- **IndexedDB**: Stores user data locally in the browser
- **localStorage**: Manages user sessions
- **Protected Routes**: Automatically redirects unauthenticated users

### How it works:

1. Users can sign up with email and password
2. User data is stored in IndexedDB
3. Sessions are managed via localStorage
4. Protected routes check authentication status
5. Users can sign out to clear their session

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd green
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication page
│   ├── social-credit/     # Social credit system
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout with auth provider
│   └── page.tsx           # Home page
├── components/             # Reusable components
│   ├── Navigation.tsx     # Navigation bar
│   └── ProtectedRoute.tsx # Route protection component
├── contexts/               # React contexts
│   └── AuthContext.tsx    # Authentication context
└── lib/                    # Utility libraries
    └── db.ts              # IndexedDB operations
```

## Usage

1. **Home Page**: Access the main waste classification feature
2. **Sign Up/Sign In**: Create an account or sign in at `/auth`
3. **Social Credit**: Access the protected social credit system (requires authentication)
4. **Navigation**: Use the navigation bar to move between sections

## Technologies Used

- **Next.js 14**: React framework with app router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **IndexedDB**: Client-side database
- **localStorage**: Session management

## Security Notes

⚠️ **Important**: This is a client-side only authentication system for demonstration purposes. In production:

- Use server-side authentication with secure sessions
- Implement proper password hashing
- Add HTTPS and secure headers
- Consider using NextAuth.js or similar solutions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

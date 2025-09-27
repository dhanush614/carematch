# CareMatch

A modern platform connecting parents with trusted caregivers, built with Next.js and Supabase.

## Features

- 🔒 Secure authentication with Supabase
- 👥 Separate flows for parents and caregivers
- 🤝 Smart matching algorithm
- 💬 Real-time messaging
- 📅 Availability management
- ⭐ Reviews and ratings
- 🎯 Customizable profiles
- 📱 Responsive design

## Tech Stack

- **Frontend:** Next.js 13+ with App Router
- **Backend:** Supabase (Authentication, Database, Storage)
- **Styling:** Tailwind CSS
- **State Management:** React Context
- **Real-time:** Supabase Realtime

## Getting Started

### Prerequisites

- Node.js 16.8 or later
- npm or yarn
- Supabase account

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Set up environment variables:
Create a `.env.local` file in the root directory and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
carematch/
├── app/                    # Next.js 13 app directory
│   ├── auth/              # Authentication pages
│   ├── components/        # Reusable components
│   ├── context/          # React Context providers
│   ├── services/         # Business logic and API calls
│   └── utils/            # Utility functions
├── lib/                   # Library configurations
└── public/               # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

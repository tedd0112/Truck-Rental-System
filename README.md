# Smart Hauling Rentals

A full-stack web application for truck rental services built with Next.js and Supabase.

## Features

- User authentication with Supabase Auth
- Truck listings and search functionality
- Booking management system
- Real-time updates with Supabase
- Google Maps integration for location services
- Responsive design with Tailwind CSS and shadcn/ui
- Separate interfaces for passengers and drivers

## Tech Stack

- **Frontend**: React 18, Next.js 14 (App Router)
- **Backend**: Next.js API routes, Supabase Functions
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Maps**: Google Maps JavaScript API
- **Styling**: Tailwind CSS, shadcn/ui
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.18.0 or later
- Supabase account
- Google Maps API key

### Installation

1. Clone the repository:

\`\`\`bash
git clone https://github.com/yourusername/smart-hauling-rentals.git
cd smart-hauling-rentals
\`\`\`

2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

3. Create a `.env.local` file in the root directory with the following variables:

\`\`\`
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Maps - this is accessed securely via a server endpoint
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
\`\`\`

4. Run the development server:

\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Vercel Deployment

1. Push your code to a GitHub repository.
2. Connect your repository to Vercel.
3. Configure the environment variables in the Vercel dashboard.
4. Deploy your application.

### Supabase Setup

1. Create a new Supabase project.
2. Enable Authentication, Database, and Storage services.
3. Set up database tables using the provided SQL scripts or the automatic setup in the app.
4. Set up storage buckets for truck images.

## User Flows

### Passenger Flow
1. User registers as a passenger
2. After verification, they are directed to the passenger dashboard
3. They can browse available trucks, make bookings, and track their rental history

### Driver Flow
1. User registers as a driver
2. After verification, they are directed to the truck registration page
3. After submitting truck details, they are directed to the driver app
4. In the driver app, they can manage jobs, track earnings, and navigate to pickup/dropoff locations

## License

This project is licensed under the MIT License - see the LICENSE file for details.

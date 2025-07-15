# CampanhaWhats - WhatsApp Campaign Manager

## Overview

CampanhaWhats is a full-stack web application for managing WhatsApp messaging campaigns. It enables users to create, manage, and send bulk WhatsApp messages with features like contact management, campaign analytics, and subscription-based access control.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**2025-01-15**: Routing and Authentication System Fixes
- Fixed critical routing issues where login/registration caused 404 errors
- Implemented proper redirection logic with window.location.reload() after auth success
- Updated App.tsx router to conditionally show components based on authentication state
- Removed problematic navigate() calls that were causing navigation failures
- Ensured all authentication flows properly redirect to dashboard after success
- Fixed logout redirection to landing page

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: Radix UI components with Tailwind CSS
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with shadcn/ui component library

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store
- **Payment Processing**: Mercado Pago integration for subscriptions

### Build System
- **Frontend**: Vite for development and production builds
- **Backend**: esbuild for production bundling
- **Type Checking**: TypeScript compiler for type safety

## Key Components

### Authentication System
- Uses Replit's OpenID Connect for user authentication
- Session-based authentication with PostgreSQL session store
- Protected routes with authentication middleware
- Admin role-based access control

### Database Schema
- **Users**: Profile information, Stripe integration, admin flags
- **Campaigns**: Message templates, settings, and metadata
- **Contacts**: Contact information linked to campaigns
- **Campaign Logs**: Message delivery tracking and analytics
- **WhatsApp Sessions**: Connection status and QR code management
- **Sessions**: Authentication session storage

### WhatsApp Integration
- External WhatsApp API service integration
- QR code authentication flow
- Session management for multiple users
- Message sending with batch processing and delays

### Payment System
- Stripe integration for subscription management
- Subscription status tracking
- Payment processing with React Stripe.js

### File Upload System
- Excel/CSV file parsing for bulk contact import
- Image upload support for campaigns
- File validation and processing

## Data Flow

1. **User Authentication**: Users authenticate via Replit Auth, sessions stored in PostgreSQL
2. **Campaign Creation**: Users create campaigns with messages, contacts, and settings
3. **Contact Management**: Bulk import via Excel files or manual entry
4. **WhatsApp Connection**: QR code scanning for WhatsApp Web authentication
5. **Message Sending**: Batch processing with configurable delays and limits
6. **Analytics**: Campaign logs track message delivery and status

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **mercadopago**: Payment processing
- **@radix-ui/react-***: UI component primitives
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling
- **zod**: Schema validation
- **xlsx**: Excel file processing

### Development Dependencies
- **vite**: Frontend build tool
- **tsx**: TypeScript execution
- **esbuild**: Backend bundling
- **tailwindcss**: CSS framework

### External Services
- **Replit Auth**: User authentication
- **Mercado Pago**: Payment processing
- **WhatsApp API**: Message sending service
- **Neon Database**: PostgreSQL hosting

## Deployment Strategy

### Development
- Vite dev server for frontend with HMR
- tsx for backend development with auto-restart
- Database migrations with Drizzle Kit

### Production
- Frontend: Vite build to static files
- Backend: esbuild bundle to single file
- Database: PostgreSQL with connection pooling
- Session storage: PostgreSQL-based sessions

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `MERCADOPAGO_ACCESS_TOKEN`: Mercado Pago API key
- `REPLIT_DOMAINS`: Authentication configuration
- `SESSION_SECRET`: Session encryption key

### Build Process
1. Frontend assets built with Vite
2. Backend bundled with esbuild
3. Database schema pushed with Drizzle
4. Single Node.js process serves both frontend and API

The application follows a monorepo structure with shared types between frontend and backend, ensuring type safety across the entire stack.
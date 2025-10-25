# New Project Starter Template (NPST)

A comprehensive full-stack system template for building enterprise applications, designed to provide a solid foundation for modern web applications with authentication, user management, and administrative features.

## Overview

The New Project Starter Template (NPST) is a modern web application template built to provide a complete foundation for enterprise applications with user management, authentication, and administrative features.

## Features

### Core Functionality
- **User Management**: Complete CRUD operations for user accounts
- **Organisation Management**: Multi-tenant organisation support
- **User Management**: Role-based access control for different user types
- **Audit Logging**: Comprehensive audit trail for all system activities
- **Dashboard Analytics**: Real-time statistics and reporting

### Authentication & Authorization
- **Role-based Access Control**: Admin, Manager, Officer, and Viewer roles
- **JWT Authentication**: Secure token-based authentication
- **User Management**: Complete user management system
- **Profile Management**: User profile and password management

### Dashboard & Analytics
- **Comprehensive Dashboard**: Real-time statistics and charts
- **User Analytics**: User activity and engagement tracking
- **Organisation Analytics**: Multi-tenant organisation metrics and monitoring

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation
- **Helmet** for security
- **Rate Limiting** for API protection

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Radix UI** for modern UI components
- **React Router** for navigation
- **React Hook Form** with Yup validation
- **Axios** for API communication
- **Recharts** for data visualization

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd npst
2. **Install dependencies**
   ```bash
   npm run install-all --legacy-peer-deps   

4. **Start MongoDB**
   ```bash
   mongod
   ```

5. **Run the application**
   ```bash
   # From the root directory
   npm run dev

   This will start both the backend server (port 5009) and frontend development server (port 3009).

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/overview` - Get overview data

### Audit
- `GET /api/audit` - Get audit logs
- `GET /api/audit/:id` - Get specific audit log

## User Roles

### Admin
- Full system access
- User management
- All CRUD operations
- System configuration

### Manager
- Organisation and user management
- User management (except admin users)
- Analytics and reporting

### Officer
- User management
- Organisation management
- Limited user management

### Viewer
- Read-only access to all data
- Dashboard and analytics
- No modification permissions

## Database Schema

The system uses MongoDB with the following main collections:

- **users** - System users and authentication
- **organisations** - Multi-tenant organisations
- **auditevents** - System audit logs and activity tracking

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet security headers
- SQL injection prevention (MongoDB)

## Development

### Backend Development
```bash
cd server
npm run dev
```

### Frontend Development
```bash
cd client
npm run dev
```

### Running Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## Production Deployment

1. **Build the frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Set production environment variables**
   ```bash
   cd server
   cp env.example .env
   # Edit .env with production values
   ```

3. **Start the production server**
   ```bash
   cd server
   npm start
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.

## Changelog

### Version 1.0.0
- Initial release
- Basic user authentication and authorization
- Multi-tenant organisation support
- Dashboard and analytics framework
- Audit logging system
- Modern responsive UI
- Ready for custom application features
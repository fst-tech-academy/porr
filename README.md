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
- MongoDB Community 7.0
- npm or yarn

### MongoDB Installation

#### macOS (using Homebrew)
```bash
# Install Homebrew if you haven't already
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install MongoDB Community 7.0
brew tap mongodb/brew
brew install mongodb-community@7.0

# Start MongoDB service
brew services start mongodb/brew/mongodb-community@7.0
```

#### Windows
1. Download MongoDB Community Server 7.0 from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. Add MongoDB to your system PATH
4. Start MongoDB service:
   ```cmd
   net start MongoDB
   ```
   Or start manually:
   ```cmd
   mongod
   ```

#### Linux (Ubuntu/Debian)
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package database
sudo apt-get update

# Install MongoDB Community 7.0
sudo apt-get install -y mongodb-org=7.0.0 mongodb-org-database=7.0.0 mongodb-org-server=7.0.0 mongodb-org-mongos=7.0.0 mongodb-org-tools=7.0.0

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

> **⚠️ Important Note for WSL Ubuntu Users**
> 
> If you're using WSL (Windows Subsystem for Linux) with Ubuntu, we **strongly recommend** installing MongoDB on Windows rather than on Ubuntu. This approach provides better performance, easier management, and avoids potential compatibility issues.
> 
> **For WSL Users:**
> 1. Install MongoDB Community 7.0 on Windows using the Windows installation instructions above
> 2. Start MongoDB as a Windows service
> 3. Connect from your WSL environment using `localhost:27017`
> 4. This ensures better integration with Windows services and tools

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd npst
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   
   **Backend Environment:**
   ```bash
   cd server
   cp env.example .env
   # Edit .env with your configuration
   ```
   
   Edit `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5009
   MONGODB_URI=mongodb://localhost:27017/npst
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   BCRYPT_ROUNDS=12
   FRONTEND_URL=http://localhost:3009
   ```

   **Frontend Environment:**
   ```bash
   cd client
   cp env.example .env
   ```
   
   Edit `.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:5009/api
   ```

4. **Start MongoDB**
   ```bash
   # macOS
   brew services start mongodb/brew/mongodb-community@7.0
   
   # Windows
   net start MongoDB
   
   # Linux
   sudo systemctl start mongod
   ```

5. **Verify MongoDB connection**
   ```bash
   cd server
   npm run check-mongodb
   ```

6. **Run the application**
   ```bash
   # From the root directory
   npm run dev
   ```

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

## Database Setup & Data Import

The project includes database setup scripts in the `dbsetup/` directory for backing up and restoring data.

### Prerequisites for Database Scripts

#### Linux/macOS
```bash
# Install MongoDB Database Tools
# macOS
brew install mongodb/brew/mongodb-database-tools

# Ubuntu/Debian
sudo apt-get install mongodb-database-tools

# CentOS/RHEL
sudo yum install mongodb-database-tools
```

#### Windows
1. Download MongoDB Database Tools from [MongoDB Download Center](https://www.mongodb.com/try/download/database-tools)
2. Extract the tools to a folder (e.g., `C:\mongodb-tools\`)
3. Add the tools folder to your system PATH

### Database Restore

#### Linux/macOS
```bash
# List available backups
cd dbsetup
./database-backup-restore.sh list

# Restore from a specific backup
./restore.sh ./backups/your_backup_file.tar.gz

# Or restore using the main script directly
./database-backup-restore.sh restore ./backups/your_backup_file.tar.gz
```

#### Windows (PowerShell)
```powershell
# List available backups
cd dbsetup
.\database-backup-restore.sh list

# Restore from a specific backup
.\database-backup-restore.sh restore .\backups\your_backup_file.tar.gz
```

#### Windows (Command Prompt)
```cmd
# List available backups
cd dbsetup
database-backup-restore.sh list

# Restore from a specific backup
database-backup-restore.sh restore .\backups\your_backup_file.tar.gz
```

### Database Script Options

The main script `database-backup-restore.sh` supports several operations:

```bash
# Available commands
./database-backup-restore.sh backup          # Create a new backup
./database-backup-restore.sh restore <file>  # Restore from backup
./database-backup-restore.sh list            # List available backups
./database-backup-restore.sh clean           # Clean old backups
./database-backup-restore.sh help            # Show help information
```

### Configuration

You can modify database connection settings in `dbsetup/database-backup-restore.sh`:

```bash
# Database configuration (edit these variables)
DB_HOST="localhost"                    # MongoDB host
DB_PORT="27017"                        # MongoDB port
DB_NAME="new_project_stater_template"  # Database name
DB_USER=""                            # Username (if authentication required)
DB_PASSWORD=""                        # Password (if authentication required)
DB_AUTH_SOURCE=""                     # Authentication database
```

### Troubleshooting Database Scripts

#### Common Issues

1. **Permission Denied (Linux/macOS)**
   ```bash
   chmod +x dbsetup/*.sh
   ```

2. **MongoDB Tools Not Found**
   - Ensure MongoDB Database Tools are installed
   - Check if tools are in your system PATH
   - On Windows, verify the tools folder is added to PATH

3. **Connection Refused**
   - Ensure MongoDB is running
   - Check if the database name and connection details are correct
   - Verify MongoDB is accessible on the specified host and port

4. **Backup File Not Found**
   - Check the `backups/` directory
   - Use `./database-backup-restore.sh list` to see available backups
   - Ensure the backup file path is correct

#### Testing Database Connection

Before running backup/restore operations, test your MongoDB connection:

```bash
# Test MongoDB connection
mongosh --eval "db.runCommand('ping')"

# Or test with specific database
mongosh new_project_stater_template --eval "db.stats()"
```

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
# Survey Platform

A full-stack survey application that allows teams to create and distribute surveys, collect user responses, and visualize results through a conversational chat interface.

## Features

### Survey Creation & Management
- Create surveys with multiple question types (text, email, phone, radio, checkbox, dropdown, rating, etc.)
- Import surveys from CSV files
- Survey lifecycle management (draft, published, closed)
- Survey analytics and response visualization
- Team-based survey organization

### Survey Distribution
- Share survey links via email
- Direct access through application interface
- Email invitations with custom messages
- Public survey access (no authentication required)

### Survey Completion
- **Conversational Chat Interface**: Unique messaging-style survey experience
- Progressive question flow with real-time validation
- Automatic duplicate response prevention (single response per email)
- Mobile-responsive design

### Response Management
- Real-time response collection and storage
- Read-only submission view in chat format
- Email confirmation with submission links
- Response analytics with charts and statistics

### Authentication & Security
- JWT-based authentication with token blacklisting
- Automatic token refresh
- Secure session management
- Team-based access control

## Technology Stack

### Backend (Django)
- **Framework**: Django 4.x with Django REST Framework
- **Database**: PostgreSQL with SQLite fallback
- **Authentication**: JWT with SimpleJWT
- **Email**: SMTP email integration
- **API**: RESTful API with comprehensive endpoints

### Frontend (React)
- **Framework**: React 18 with hooks
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Charts**: Recharts for analytics visualization
- **HTTP Client**: Axios with interceptors
- **State Management**: React Context API

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL (optional, defaults to SQLite)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd surveycorps/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv env
   source env/bin/activate  # On Windows: env\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment configuration**
   Create `.env` file in backend root:
   ```env
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   
   # Database (SQLite default)
   DATABASE_NAME=db.sqlite3
   DATABASE_USER=user
   DATABASE_USER_PASSWORD=password
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   
   # Frontend URLs
   FRONTEND_PROTOCOL=http
   FRONTEND_HOST=localhost:3000
   
   # Email Configuration
   EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USE_TLS=True
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-app-password
   DEFAULT_FROM_EMAIL=noreply@surveycorps.com
   ```

5. **Database setup**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Run development server**
   ```bash
   python manage.py runserver
   ```

   Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd surveycorps/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   Create `.env` file in frontend root:
   ```env
   REACT_APP_API_BASE_URL=http://localhost:8000/
   ```

4. **Install additional dependencies**
   ```bash
   npm install recharts universal-cookie
   ```

5. **Run development server**
   ```bash
   npm start
   ```

   Frontend will be available at `http://localhost:3000`

## Usage

### Creating a Survey

1. **Login/Register** through the authentication system
2. **Navigate to Dashboard** → Surveys
3. **Click "Create Survey"** button
4. **Fill Basic Information**:
   - Survey title and description
   - Category selection
   - Optional start/end dates
5. **Add Questions**:
   - Use the question editor to add various question types
   - Configure options for multiple choice questions
   - Set required/optional flags
6. **Save and Publish** your survey

### Distributing Surveys

1. **From survey list**, click the distribute button
2. **Choose distribution method**:
   - Copy public link for manual sharing
   - Send email invitations with custom message
   - Embed in external platforms

### Taking Surveys

1. **Access survey** via public link
2. **Complete user information** (name, email, phone)
3. **Answer questions** through conversational chat interface
4. **Submit responses** and receive confirmation email
5. **View submission** anytime via provided link

### Managing Responses

1. **View survey analytics** from dashboard
2. **Access detailed responses** through survey detail page
3. **Export data** for further analysis
4. **Monitor response rates** with built-in charts

## API Endpoints

### Authentication
- `POST /auth/login/` - User login
- `POST /auth/logout/` - User logout
- `POST /auth/token/refresh/` - Refresh JWT tokens

### Surveys
- `GET /survey/` - List user's surveys
- `POST /survey/` - Create new survey
- `GET /survey/{oid}/` - Get survey details
- `DELETE /survey/{oid}/` - Delete survey
- `POST /survey/{oid}/publish/` - Publish/unpublish survey

### Public Survey Access
- `GET /survey/{oid}/fill/` - Get public survey
- `POST /survey/{oid}/fill/` - Submit survey response
- `POST /survey/{oid}/check-submission/` - Check if email already submitted

### Submissions
- `GET /survey/submission/{response_oid}/view/` - View submitted response

## Architecture

### Database Models
- **User**: Authentication and team management
- **Team**: Organization structure
- **Survey**: Survey configuration and metadata
- **Respondent**: Survey participant information
- **SurveyResponse**: Individual response storage

### Key Features Implementation
- **Chat Interface**: Custom React components with progressive form flow
- **Duplicate Prevention**: Email-based submission tracking
- **Analytics**: Real-time chart generation with response data
- **Email Integration**: Automated confirmation and invitation emails
- **Token Management**: Secure JWT with blacklisting and auto-refresh

## Development

### Code Structure
```
backend/
├── sc_api/
│   ├── apps/
│   │   ├── authentication/    # User auth & JWT management
│   │   ├── schema/           # Database models
│   │   ├── survey/           # Survey CRUD & responses
│   │   └── utils/            # Email & helper functions
│   └── settings.py           # Django configuration

frontend/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── survey/Detail/    # Survey detail page components
│   │   ├── survey/Chat/      # Chat interface components
│   │   └── common/           # Shared components
│   ├── pages/               # Page-level components
│   ├── services/            # API integration
│   ├── context/             # React Context providers
│   └── hooks/               # Custom React hooks
```

### Contributing
1. Follow existing code style and patterns
2. Write comprehensive tests for new features
3. Update documentation for API changes
4. Use semantic commit messages

### Testing
```bash
# Backend tests
python manage.py test

# Frontend tests
npm test
```

## Deployment

### Backend Deployment
1. Set production environment variables
2. Configure PostgreSQL database
3. Set up email service (SendGrid, AWS SES, etc.)
4. Configure static file serving
5. Set up SSL certificates

### Frontend Deployment
1. Update API base URL for production
2. Build production bundle: `npm run build`
3. Deploy to static hosting (Vercel, Netlify, AWS S3)
4. Configure domain and SSL

## Support

For issues, feature requests, or questions:
1. Check existing documentation
2. Review API endpoints and error responses
3. Check browser console for frontend issues
4. Review Django logs for backend issues

## License

This project is licensed under the MIT License.
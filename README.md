
# Defense Scheduler System

A comprehensive web-based defense scheduling system designed for academic institutions to manage thesis defense sessions, professor assignments, and scheduling preferences through an intuitive role-based interface.

## 🎯 Overview

The Defense Scheduler is a full-stack web application that streamlines the process of scheduling academic defense sessions. It provides three distinct user interfaces (Manager, Assistant, Professor) with role-based access control, real-time updates, and comprehensive scheduling management.

## 🏗️ System Architecture

### Technology Stack

- **Backend**: PHP 8.3+ with RESTful API
- **Database**: PostgreSQL with comprehensive schema
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js for data visualization
- **Dependencies**: PHPOffice/PhpSpreadsheet for Excel export
- **Development Server**: PHP built-in development server
- **Authentication**: Bearer token-based API authentication

### Core Components

1. **Backend API** (`backend/index.php`) - Central API handling all business logic
2. **Database Schema** (`database/init.sql`) - PostgreSQL schema with 8 main tables
3. **Frontend Consoles** - Three role-specific interfaces
4. **Router** (`router.php`) - Simple PHP router for development server
5. **Testing Scripts** - Automated data population and testing tools

## 👥 User Roles & Permissions

### Manager Console
- **Full System Access**: Complete administrative control
- **User Management**: Create, edit, delete users (professors, assistants)
- **Window Management**: Create, edit, delete defense windows
- **Offer Management**: Send offers to professors, track responses
- **Poll System**: Create polls, view results, export data
- **Analytics**: Comprehensive insights and reporting
- **Finalization**: Approve and finalize accepted offers

### Assistant Console
- **Limited Administrative Access**: Most manager functions except user deletion
- **Window Creation**: Create and manage defense windows
- **Offer Management**: Send offers to professors
- **Professor Management**: Create new professors (cannot manage managers)
- **Poll Participation**: View poll results and analytics
- **Offer Tracking**: Monitor offer statuses and responses

### Professor Console
- **Personal Dashboard**: View assigned slots and offers
- **Offer Management**: Accept, decline, or request changes to offers
- **Poll Participation**: Vote on scheduling preferences
- **Schedule Overview**: Visual charts of defense schedule
- **Notes System**: Add personal notes to defense slots

## 🗄️ Database Schema

### Core Tables

1. **`app_users`** - User management with role-based access
2. **`manager_windows`** - Defense time windows created by managers/assistants
3. **`window_offers`** - Offers made to professors for specific windows
4. **`offer_slots`** - Granular time slots within windows
5. **`defense_slots`** - Final scheduled defense times
6. **`professor_notes`** - Personal notes from professors
7. **`polls`** - Scheduling preference polls
8. **`poll_options`** - Poll choices and time slots
9. **`poll_votes`** - Individual votes from professors

### Key Features
- **Role-based Access Control**: Three distinct user roles
- **Foreign Key Constraints**: Data integrity enforcement
- **Performance Indexes**: Optimized for common queries
- **Flexible Poll System**: Text and time-slot based polls
- **Comprehensive Tracking**: Full audit trail of all actions

## 🚀 Getting Started

### Prerequisites

- **PHP 8.3+** (required for Composer dependencies)
- **PostgreSQL** (database server)
- **Composer** (PHP dependency manager)
- **jq** (JSON processor for testing scripts)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PluginForHSE
   ```

2. **Install PHP dependencies**
   ```bash
   cd backend
   composer install
   ```

3. **Set up PostgreSQL database**
   ```bash
   createdb defense
   psql -d defense -f database/init.sql
   ```

4. **Start the development server**
   ```bash
   php -S localhost:8000 router.php
   ```

5. **Access the application**
   - Open `http://localhost:8000` in your browser
   - Use the default manager token: `devtoken`

### Default Credentials

- **Manager Token**: `devtoken` (created automatically)
- **Database**: `defense` (PostgreSQL)
- **Server**: `localhost:8000`

## 📁 File Structure

```
PluginForHSE/
├── backend/
│   ├── index.php              # Main API endpoint
│   ├── composer.json          # PHP dependencies
│   └── vendor/                # Composer packages
├── database/
│   └── init.sql               # Database schema
├── frontend/
│   ├── index.html             # Login page
│   ├── index.js               # Login logic
│   ├── index.css              # Login styles
│   ├── Manager.html           # Manager console
│   ├── Manager.js             # Manager functionality
│   ├── Manager.css            # Manager styles
│   ├── assistant.html         # Assistant console
│   ├── assistant.js           # Assistant functionality
│   ├── assistant.css          # Assistant styles
│   ├── Professor.html         # Professor console
│   ├── professor.js           # Professor functionality
│   └── professor.css          # Professor styles
├── all_scripts/
│   └── improved_large_scale_script.sh  # Testing script
├── router.php                 # Development server router
└── README.md                  # This file
```

## 🔧 API Endpoints

### Authentication & User Management
- `GET /?action=whoami` - Get current user info
- `GET /?action=users` - List all users
- `POST /?action=create_user` - Create new user
- `POST /?action=delete_user` - Delete user (Manager only)

### Window & Offer Management
- `POST /?action=create_window` - Create defense window
- `GET /?action=windows` - List all windows
- `POST /?action=offer_window` - Offer window to professor
- `GET /?action=my_offers` - Get offers
- `POST /?action=respond_offer` - Professor respond to offer
- `POST /?action=finalize_offer` - Finalize accepted offer

### Poll System
- `POST /?action=create_poll` - Create new poll
- `GET /?action=polls` - List all polls
- `POST /?action=vote_poll` - Vote on poll
- `GET /?action=poll_results` - Get poll results
- `POST /?action=export_polls` - Export polls to Excel

### Defense Slots & Notes
- `GET /?action=slots` - Get defense slots
- `POST /?action=slots` - Create defense slot
- `GET /?action=notes` - Get professor notes
- `POST /?action=save_note` - Save professor note

## 🎨 User Interface Features

### Manager Console
- **Dashboard**: Real-time KPIs and analytics
- **Poll Creation**: Text and time-slot based polls
- **Window Management**: Create and edit defense windows
- **Offer System**: Send offers with slot selection
- **User Management**: Create and manage users
- **Export Functionality**: Excel export for polls and data
- **Visual Analytics**: Charts and graphs for insights

### Assistant Console
- **Professor Overview**: Visual topology of professor relationships
- **Window Creation**: Simplified window creation interface
- **Offer Management**: Send offers to professors
- **Limited User Management**: Create professors only
- **Analytics**: Professor and offer statistics

### Professor Console
- **Schedule Overview**: Visual charts of defense schedule
- **Offer Management**: Accept, decline, or request changes
- **Poll Participation**: Vote on scheduling preferences
- **Personal Notes**: Add notes to defense slots
- **Real-time Updates**: Live dashboard with current status

## 🧪 Testing & Data Population

### Automated Testing Script
The system includes a comprehensive testing script (`all_scripts/improved_large_scale_script.sh`) that:

- **Creates 50 professors** with realistic names
- **Creates 5 assistants** for testing
- **Generates 9 diverse polls** (text and time-slot based)
- **Simulates 70% voting participation** (realistic scenario)
- **Creates 10 defense windows** with proper scheduling
- **Ensures all professors get offers** (no zero-offer professors)
- **Simulates realistic responses** (accept, decline, request changes)
- **Finalizes accepted offers** automatically

### Running the Test Script
```bash
./all_scripts/improved_large_scale_script.sh
```

## 🌐 Internationalization

The system supports multiple languages:
- **English (EN)** - Default language
- **Russian (RU)** - Full translation support
- **Dynamic Language Switching** - Real-time language changes
- **Comprehensive i18n** - All UI elements translated

## 📊 Key Features

### Poll System
- **Text Polls**: Custom options for preferences
- **Time-slot Polls**: Automated time slot generation
- **Custom Timeslots**: Manual time range definition
- **Voting Security**: One vote per user per poll
- **Export Functionality**: Excel export with results
- **Real-time Results**: Live vote counting and display

### Window Management
- **Flexible Scheduling**: Start/end times with automatic calculation
- **Break Management**: Configurable breaks between defenses
- **Slot Assignment**: Granular control over individual slots
- **Preview System**: Real-time preview of generated slots
- **Edit Capabilities**: Full window editing and updates

### Offer System
- **Multi-professor Offers**: Send offers to multiple professors
- **Slot Selection**: Choose specific slots for each professor
- **Response Tracking**: Accept, decline, request changes
- **Change Requests**: Professors can request different times
- **Finalization**: Manager approval for accepted offers

### Analytics & Reporting
- **Real-time KPIs**: User counts, offers, windows, slots
- **Visual Charts**: Donut charts, bar charts, sparklines
- **Professor Topology**: Visual relationship mapping
- **Export Capabilities**: Excel export for all data
- **Comprehensive Filtering**: Search and filter all data

## 🔒 Security Features

- **Bearer Token Authentication**: Secure API access
- **Role-based Access Control**: Strict permission system
- **Input Validation**: Comprehensive data validation
- **SQL Injection Protection**: Prepared statements
- **XSS Protection**: Output escaping and sanitization
- **CSRF Protection**: Token-based request validation

## 🚀 Performance Optimizations

- **Database Indexing**: Optimized queries with proper indexes
- **Efficient API Design**: RESTful endpoints with minimal overhead
- **Client-side Caching**: Reduced server requests
- **Real-time Updates**: Server-Sent Events for live data
- **Responsive Design**: Mobile-friendly interfaces
- **Lazy Loading**: On-demand data loading

## 🛠️ Development

### Adding New Features
1. **Backend**: Add new endpoints to `backend/index.php`
2. **Frontend**: Update relevant console files
3. **Database**: Modify schema in `database/init.sql`
4. **Testing**: Update testing scripts as needed

### Code Structure
- **Modular Design**: Separate files for each console
- **Consistent Styling**: Unified CSS framework
- **Error Handling**: Comprehensive error management
- **Logging**: Detailed operation logging
- **Documentation**: Inline code documentation

## 📈 Future Enhancements

- **Email Notifications**: Automated email alerts
- **Calendar Integration**: Google Calendar/Outlook sync
- **Mobile App**: Native mobile applications
- **Advanced Analytics**: Machine learning insights
- **Multi-language Support**: Additional language packs
- **API Documentation**: Swagger/OpenAPI documentation
- **Docker Support**: Containerized deployment
- **Cloud Integration**: AWS/Azure deployment options

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

**Defense Scheduler System** - Streamlining academic defense scheduling with modern web technologies and intuitive user interfaces.
**Managers Console**
<img width="1678" height="943" alt="Screenshot 2025-10-23 at 6 19 16 PM" src="https://github.com/user-attachments/assets/7b5bcf84-75f2-4f04-aab8-80a494f7a1ce" />
<img width="1672" height="973" alt="Screenshot 2025-10-23 at 6 19 32 PM" src="https://github.com/user-attachments/assets/24d5a467-2404-41a9-93bf-49f7381b69e3" />
<img width="1681" height="983" alt="Screenshot 2025-10-23 at 6 19 44 PM" src="https://github.com/user-attachments/assets/c027fb5e-a266-462d-97f9-e76f06d7c20b" />
<img width="1686" height="978" alt="Screenshot 2025-10-23 at 6 20 01 PM" src="https://github.com/user-attachments/assets/4821ad8c-65e3-485b-b538-51759bc41414" />



**Assistants Console**
<img width="1375" height="975" alt="Screenshot 2025-10-23 at 6 20 55 PM" src="https://github.com/user-attachments/assets/47efa9f9-f4ee-46bc-9b71-daa505e8eb00" />
<img width="1365" height="988" alt="Screenshot 2025-10-23 at 6 21 05 PM" src="https://github.com/user-attachments/assets/5d3cb9f0-4ccd-446e-86ca-0f74497f782f" />
<img width="1358" height="993" alt="Screenshot 2025-10-23 at 6 21 24 PM" src="https://github.com/user-attachments/assets/e804564d-e261-4f7b-b387-8c1162228905" />



**Professors Console**
<img width="1621" height="986" alt="Screenshot 2025-10-23 at 6 23 52 PM" src="https://github.com/user-attachments/assets/13825828-705d-44a6-87c9-a3885e7bde1b" />
<img width="1625" height="990" alt="Screenshot 2025-10-23 at 6 24 22 PM" src="https://github.com/user-attachments/assets/6e6fed8d-d42c-4aa7-992d-825f39b81bc1" />


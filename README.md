# Peer-Assisted Grievance Resolution & Resource Sharing Portal

A full-stack web application that enables students to collaboratively resolve grievances and share academic resources within an institution.

---

## Features

### Authentication
- Secure user registration and login  
- Role-based access (Student / Admin)  
- Session management using local storage  

### Grievance Management
- Post grievances  
- View all grievances  
- Reply to grievances (discussion system)  
- Mark grievances as resolved  

### Resource Sharing
- Share digital resources (links)  
- Share physical resources (books/devices)  
- View and browse resources  

### Resource Requests
- Request resources from other students  
- Fulfill requests  
- Track request status (open / fulfilled / received)  

### 🛠 Admin Panel
- View all grievances  
- Delete inappropriate grievances  
- Manage resources  
- Manage resource requests  

---

## Tech Stack

**Frontend**
- HTML  
- CSS  
- JavaScript (ES6 Modules)  

**Backend**
- Node.js  
- Express.js  

**Database**
- PostgreSQL  

---

## System Architecture

User Browser → Frontend → Backend API → PostgreSQL Database

---

## 📂 Project Structure

```text
peer-portal/
├── frontend/
│   ├── css/
│   ├── js/
│   ├── admin.html
│   ├── dashboard.html
│   ├── grievances.html
│   ├── resources.html
│   ├── login.html
│
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── grievanceController.js
│   │   ├── resourceController.js
│   │   ├── requestController.js
│   │   ├── replyController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── grievanceRoutes.js
│   │   ├── resourceRoutes.js
│   │   ├── requestRoutes.js
│   │   ├── replyRoutes.js
│   ├── config/
│   │   ├── db.js
│   ├── server.js
│
└── README.md
```

---

## Database Design

Main Tables:
- Users  
- Grievances  
- Replies  
- Resources  
- Requests  

Uses relational structure with foreign keys to maintain data integrity.

---

## Security

- Passwords stored using hashing  
- Role-based access control  
- Secure API communication using JSON  

---

## Future Improvements

- File upload support for resources  
- Notification system  
- UI/UX enhancements  
- deployment  

---

## Authors

- Manas Maru  
- Manas Jain  
- Madhur Soni  

---
# 📱 Dr. Mimu Mobile API Documentation

## 🚀 **API Base URL**
```
Production: https://your-domain.com/api
Development: http://localhost:3001/api
```

## 🔐 **Authentication**
All protected endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📋 **Complete API Endpoints for Expo Mobile App**

### 🏥 **Health Check**
```http
GET /health
```
**Response:**
```json
{
  "status": "OK",
  "message": "Dr. Mimu API is running",
  "timestamp": "2025-09-10T03:34:02.515Z",
  "uptime": 67.61,
  "environment": "development",
  "version": "1.0.0",
  "memory": {
    "used": 17.13,
    "total": 18.67
  }
}
```

---

### 🔐 **Authentication Endpoints**

#### **User Registration**
```http
POST /api/auth/register
```
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+8801234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "male"
}
```
**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt_token_here"
  }
}
```

#### **User Login**
```http
POST /api/auth/login
```
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt_token_here"
  }
}
```

#### **Password Reset**
```http
POST /api/auth/forgot-password
```
**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### **Token Refresh**
```http
POST /api/auth/refresh
```
**Headers:** `Authorization: Bearer <refresh_token>`

---

### 👤 **User Management**

#### **Get User Profile**
```http
GET /api/users/profile
```
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+8801234567890",
    "avatar": "https://example.com/avatar.jpg",
    "dateOfBirth": "1990-01-01",
    "gender": "male",
    "address": "Dhaka, Bangladesh",
    "bloodGroup": "A+",
    "allergies": ["Peanuts", "Shellfish"],
    "chronicConditions": ["Diabetes"]
  }
}
```

#### **Update User Profile**
```http
PUT /api/users/profile
```
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "name": "John Doe Updated",
  "phone": "+8801234567890",
  "address": "New Address",
  "bloodGroup": "A+",
  "allergies": ["Peanuts"],
  "chronicConditions": ["Diabetes"]
}
```

#### **Upload Avatar**
```http
POST /api/users/avatar
```
**Headers:** `Authorization: Bearer <token>`
**Content-Type:** `multipart/form-data`
**Form Data:** `avatar: <image_file>`

---

### 🏥 **Medical Records**

#### **Get All Medical Records**
```http
GET /api/medical-records
```
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Records per page (default: 10)
- `type`: Record type filter
- `search`: Search term

**Response:**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "uuid",
        "recordType": "prescription",
        "title": "Regular Checkup",
        "description": "Annual health checkup",
        "doctorName": "Dr. Smith",
        "hospitalName": "City Hospital",
        "dateRecorded": "2024-01-15",
        "fileUrl": "https://example.com/record.pdf",
        "tags": ["checkup", "annual"]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

#### **Create Medical Record**
```http
POST /api/medical-records
```
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "recordType": "prescription",
  "title": "Blood Test Results",
  "description": "Complete blood count results",
  "doctorName": "Dr. Rahman",
  "hospitalName": "Dhaka Medical",
  "dateRecorded": "2024-01-15",
  "tags": ["blood-test", "lab-report"]
}
```

#### **Upload Medical File**
```http
POST /api/medical-records/:id/upload
```
**Headers:** `Authorization: Bearer <token>`
**Content-Type:** `multipart/form-data`
**Form Data:** `file: <pdf_or_image_file>`

#### **Get Single Medical Record**
```http
GET /api/medical-records/:id
```
**Headers:** `Authorization: Bearer <token>`

#### **Update Medical Record**
```http
PUT /api/medical-records/:id
```
**Headers:** `Authorization: Bearer <token>`

#### **Delete Medical Record**
```http
DELETE /api/medical-records/:id
```
**Headers:** `Authorization: Bearer <token>`

---

### 📅 **Appointments**

#### **Get All Appointments**
```http
GET /api/appointments
```
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
- `status`: upcoming, completed, cancelled
- `date`: Filter by date (YYYY-MM-DD)
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": "uuid",
        "doctorName": "Dr. Rahman",
        "doctorSpecialty": "Cardiology",
        "hospitalName": "Square Hospital",
        "appointmentDate": "2024-01-20",
        "appointmentTime": "10:00:00",
        "appointmentType": "consultation",
        "status": "scheduled",
        "symptoms": "Chest pain",
        "notes": "Follow-up appointment"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  }
}
```

#### **Create Appointment**
```http
POST /api/appointments
```
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "doctorName": "Dr. Rahman",
  "doctorSpecialty": "Cardiology",
  "hospitalName": "Square Hospital",
  "appointmentDate": "2024-01-20",
  "appointmentTime": "10:00:00",
  "appointmentType": "consultation",
  "symptoms": "Chest pain",
  "notes": "First visit"
}
```

#### **Update Appointment**
```http
PUT /api/appointments/:id
```
**Headers:** `Authorization: Bearer <token>`

#### **Cancel Appointment**
```http
PATCH /api/appointments/:id/cancel
```
**Headers:** `Authorization: Bearer <token>`

---

### 💊 **Medicine Reminders**

#### **Get All Reminders**
```http
GET /api/reminders
```
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
- `status`: active, completed, paused
- `date`: Filter by date

**Response:**
```json
{
  "success": true,
  "data": {
    "reminders": [
      {
        "id": "uuid",
        "medicineName": "Paracetamol",
        "dosage": "500mg",
        "frequency": "twice daily",
        "startDate": "2024-01-01",
        "endDate": "2024-01-07",
        "reminderTimes": ["08:00:00", "20:00:00"],
        "instructions": "Take after meals",
        "status": "active",
        "adherenceRate": 85.5
      }
    ]
  }
}
```

#### **Create Medicine Reminder**
```http
POST /api/reminders
```
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "medicineName": "Paracetamol",
  "dosage": "500mg",
  "frequency": "twice daily",
  "startDate": "2024-01-01",
  "endDate": "2024-01-07",
  "reminderTimes": ["08:00:00", "20:00:00"],
  "instructions": "Take after meals"
}
```

#### **Mark Medicine as Taken**
```http
POST /api/reminders/:id/taken
```
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "takenAt": "2024-01-01T08:00:00Z",
  "notes": "Taken with breakfast"
}
```

---

### 🤖 **AI Chat Assistant**

#### **Start Chat Session**
```http
POST /api/chat/sessions
```
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "sessionName": "Health Consultation",
  "language": "bn"
}
```

#### **Send Message**
```http
POST /api/chat/sessions/:sessionId/messages
```
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "message": "আমার মাথা ব্যথা করছে",
  "messageType": "text"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userMessage": {
      "id": "uuid",
      "content": "আমার মাথা ব্যথা করছে",
      "messageType": "user",
      "timestamp": "2024-01-01T10:00:00Z"
    },
    "aiResponse": {
      "id": "uuid",
      "content": "মাথা ব্যথার কারণ বিভিন্ন হতে পারে...",
      "messageType": "assistant",
      "timestamp": "2024-01-01T10:00:05Z",
      "suggestions": [
        "পর্যাপ্ত পানি পান করুন",
        "বিশ্রাম নিন",
        "ডাক্তারের পরামর্শ নিন"
      ]
    }
  }
}
```

#### **Get Chat History**
```http
GET /api/chat/sessions/:sessionId/messages
```
**Headers:** `Authorization: Bearer <token>`

---

### 🔍 **Search & Knowledge Base**

#### **Search Medical Information**
```http
GET /api/search
```
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
- `q`: Search query
- `type`: medicine, disease, symptom
- `language`: bn, en

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "uuid",
        "title": "Paracetamol",
        "type": "medicine",
        "description": "Pain reliever and fever reducer",
        "dosage": "500mg-1000mg every 4-6 hours",
        "sideEffects": ["Nausea", "Liver damage (overdose)"],
        "relevanceScore": 0.95
      }
    ],
    "totalResults": 15
  }
}
```

---

### 📊 **Health Analytics**

#### **Get Health Metrics**
```http
GET /api/analytics/health-metrics
```
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
- `period`: week, month, year
- `metric`: weight, blood_pressure, blood_sugar

#### **Add Health Metric**
```http
POST /api/analytics/health-metrics
```
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "metricType": "blood_pressure",
  "value": {
    "systolic": 120,
    "diastolic": 80
  },
  "unit": "mmHg",
  "recordedAt": "2024-01-01T10:00:00Z",
  "notes": "Morning reading"
}
```

---

### 🔔 **Notifications**

#### **Get Notifications**
```http
GET /api/notifications
```
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
- `status`: read, unread
- `type`: reminder, appointment, system

#### **Mark as Read**
```http
PATCH /api/notifications/:id/read
```
**Headers:** `Authorization: Bearer <token>`

#### **Update FCM Token**
```http
POST /api/notifications/fcm-token
```
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "fcmToken": "firebase_token_here",
  "deviceType": "android"
}
```

---

## 📱 **Expo Integration Examples**

### **Setup API Client**
```javascript
// api/client.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3001/api' 
  : 'https://your-production-api.com/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

### **Authentication Service**
```javascript
// services/authService.js
import apiClient from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  async login(email, password) {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    
    if (response.data.success) {
      await AsyncStorage.setItem('authToken', response.data.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  },

  async register(userData) {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  async logout() {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
  },
};
```

### **Medical Records Service**
```javascript
// services/medicalService.js
import apiClient from '../api/client';

export const medicalService = {
  async getMedicalRecords(page = 1, limit = 10) {
    const response = await apiClient.get('/medical-records', {
      params: { page, limit },
    });
    return response.data;
  },

  async createMedicalRecord(recordData) {
    const response = await apiClient.post('/medical-records', recordData);
    return response.data;
  },

  async uploadMedicalFile(recordId, fileUri) {
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: 'image/jpeg',
      name: 'medical-record.jpg',
    });

    const response = await apiClient.post(
      `/medical-records/${recordId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};
```

### **Chat Service**
```javascript
// services/chatService.js
import apiClient from '../api/client';

export const chatService = {
  async startChatSession(sessionName = 'Health Consultation') {
    const response = await apiClient.post('/chat/sessions', {
      sessionName,
      language: 'bn',
    });
    return response.data;
  },

  async sendMessage(sessionId, message) {
    const response = await apiClient.post(
      `/chat/sessions/${sessionId}/messages`,
      {
        message,
        messageType: 'text',
      }
    );
    return response.data;
  },

  async getChatHistory(sessionId) {
    const response = await apiClient.get(`/chat/sessions/${sessionId}/messages`);
    return response.data;
  },
};
```

---

## 🔧 **Error Handling**

### **Standard Error Response**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": "Email is required",
      "password": "Password must be at least 6 characters"
    }
  },
  "timestamp": "2024-01-01T10:00:00Z"
}
```

### **HTTP Status Codes**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

---

## 🔒 **Security Features**
- JWT Authentication
- Rate Limiting (100 requests per 15 minutes)
- CORS Protection
- Helmet Security Headers
- Input Validation
- SQL Injection Protection
- XSS Protection

---

## 📱 **Mobile-Specific Considerations**

### **Offline Support**
- Cache user profile data
- Store chat history locally
- Queue API calls when offline
- Sync when connection restored

### **Push Notifications**
- Medicine reminders
- Appointment notifications
- Health tips
- Emergency alerts

### **File Upload Optimization**
- Image compression before upload
- Progress tracking
- Retry mechanism
- Background upload support

---

## 🚀 **Performance Tips**
- Use pagination for large data sets
- Implement caching for frequently accessed data
- Optimize images before upload
- Use debouncing for search queries
- Implement pull-to-refresh
- Use lazy loading for lists

---

## 📞 **Support**
For API support and questions:
- Email: api-support@drmimu.com
- Documentation: https://docs.drmimu.com
- Status Page: https://status.drmimu.com
# Zesto

![System Architecture](./screenshots/system-architecture.png)

## Overview

Zesto is a high-performance, microservices-driven food delivery platform offering real-time order tracking, secure role-based access, and automated rider dispatching.

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, TypeScript, React Router DOM, Tailwind CSS, React Icons, React Hot Toast, Leaflet, Socket.io-client, Axios |
| **Backend** | Node.js, Express.js, TypeScript, Concurrently, MongoDB, Mongoose, JWT, OAuth 2.0 (Google APIs), Bcrypt, CORS, Socket.io, amqplib (RabbitMQ), Multer, Cloudinary, DataURI, Razorpay, Nodemailer, Google SMTP Server, Handlebars |
| **DevOps & Infrastructure** | Docker (custom Dockerfiles per service), Render (Backend), Vercel (Frontend), AWS EC2 (RabbitMQ) |

## Key Features

* Strict Role-Based Access Control (RBAC) via JWT and OAuth 2.0 (Google).
* Automated rider dispatching with broadcasts to available riders within a 3km radius every 10 seconds.
* Live location tracking implemented using Leaflet and WebSockets.
* Secure delivery verification utilizing client-side OTP validation.
* Single-order concurrency enforcement for delivery agents.
* Comprehensive Seller Dashboard for menu management, open/close status toggles, and order state advancement.
* Admin governance for validating and activating restaurant and rider profiles.
* Internal microservice security utilizing header-based internal keys.
* Asynchronous payment processing using Razorpay and RabbitMQ.

## Backend Services Architecture

The backend system is segmented into discrete microservices to maintain scalability and clear separation of concerns:

* **Auth Service:** Manages RBAC, Google OAuth integration, JWT issuance, and manual user registration.
* **Restaurant Service:** Controls menu management, restaurant status toggles, order state tracking (placed, preparing, ready_for_rider), and executes the 3km rider dispatch logic.
* **Rider Service:** Handles rider registration, enforces the active order constraint (limit of 1 active order), manages order status updates (picked_up, delivered), and performs OTP verification.
* **Utils Service:** Manages background workers for Razorpay webhook processing, Cloudinary image uploads, and transactional email deliveries via Nodemailer and Handlebars.
* **Admin Service:** Facilitates the validation and approval workflow for new sellers and riders.
* **Realtime Service:** Handles WebSocket management for distributing live order status updates and dispatch notifications.
* **Verification Service:** Generates and validates OTPs to secure order handoffs.

## RabbitMQ Integration

RabbitMQ serves as the primary message broker to decouple heavy and asynchronous tasks, preventing request blocking and ensuring robust failure handling.

* **Payment Processing Queue:** Processes Razorpay success events asynchronously.
* **Email Queue:** Manages the distribution of welcome messages, OTP communications, and admin alerts.
* **OTP Distribution Workflow:** Offloads the OTP dispatch process to background workers for improved endpoint performance.

## Order & Payment Flow

![Order & Payment Flow](./screenshots/order&payment-flow.png)

1. **Checkout:** The client initiates the payment process through Razorpay.
2. **Order Creation:** The order is recorded in the database with an `Unpaid` status and an automated 10-minute deletion timer.
3. **Asynchronous Event:** Upon successful transaction, an asynchronous event (`payment.verified`) is dispatched to RabbitMQ.
4. **Event Consumption:** The Restaurant Service consumer retrieves the verified payment event.
5. **State Update:** The order status is mutated to `Paid`.
6. **Internal Notification:** An internal API call, secured with a header-based internal key, notifies the Realtime Service.
7. **WebSocket Push:** The Realtime Service emits a WebSocket payload to update the Restaurant Dashboard with the new order.

## Screenshots

### User Interface
![User Interface](./screenshots/user-interface.png)

### Rider Portal
![Rider Portal](./screenshots/rider-portal.png)

### Admin Portal
![Admin Portal](./screenshots/admin-portal.png)

### Restaurant Page
![Restaurant Page](./screenshots/restaurant-page.png)

### Order Tracking
![Order Tracking](./screenshots/order-tracking.png)

### Cart Page
![Cart Page](./screenshots/cart-page.png)

## Installation / Getting Started

### 1. Setup RabbitMQ

First, install and run the RabbitMQ container using Docker:

```bash
docker run -d --hostname rabbitmq-host --name rabbitmq-container -e RABBITMQ_DEFAULT_USER=admin -e RABBITMQ_DEFAULT_PASS=admin123 -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

### 2. Environment Variables Configuration

Create a `.env` file in each respective service directory and populate them with the following configurations:

#### Admin Service (`services/admin/.env`)
```env
PORT=5006
MONGO_URI=xxxxx
JWT_SEC=kdiankrkcjckiekdjke
DBNAME=Zesto
```

#### Auth Service (`services/auth/.env`)
```env
PORT=5000
MONGO_URI=xxxxx
JWT_SEC=kdiankrkcjckiekdjke
GOOGLE_CLIENT_ID=xxxxxxxxxxxxxxxxxx
GOOGLE_CLIENT_SECRET=xxxxx
GOOGLE_REDIRECT_URI=http://localhost:5173/login
UTILS_SERVICE=http://localhost:5002
EMAIL_QUEUE=email_queue
RABBITMQ_URL=amqp://admin:admin123@localhost:5672
INTERNAL_SERVICE_KEY=kdk38kd=jkkej9393039jkjkjinrian202-2=20mjjn\/kdjj
FRONTEND_URL=https://zesto-frontend.vercel.app
```

#### Realtime Service (`services/realtime/.env`)
```env
PORT=5004
JWT_SEC=kdiankrkcjckiekdjke
INTERNAL_SERVICE_KEY=kdk38kd=jkkej9393039jkjkjinrian202-2=20mjjn\/kdjj
```

#### Restaurant Service (`services/restaurant/.env`)
```env
PORT=5001
MONGO_URI=xxxxxx
JWT_SEC=kdiankrkcjckiekdjke
UTILS_SERVICE=http://localhost:5002
REALTIME_SERVICE=http://localhost:5004
VERIFICATION_SERVICE=http://localhost:5007
INTERNAL_SERVICE_KEY=kdk38kd=jkkej9393039jkjkjinrian202-2=20mjjn\/kdjj
RABBITMQ_URL=amqp://admin:admin123@localhost:5672
PAYMENT_QUEUE=payment_event
RIDER_QUEUE=rider_queue
ORDER_READY_QUEUE=order_ready_queue
```

#### Rider Service (`services/rider/.env`)
```env
PORT=5005
MONGO_URI=xxxxxx
JWT_SEC=kdiankrkcjckiekdjke
UTILS_SERVICE=http://localhost:5002
REALTIME_SERVICE=http://localhost:5004
RESTAURANT_SERVICE=http://localhost:5001
INTERNAL_SERVICE_KEY=kdk38kd=jkkej9393039jkjkjinrian202-2=20mjjn\/kdjj
RABBITMQ_URL=amqp://admin:admin123@localhost:5672
RIDER_QUEUE=rider_queue
ORDER_READY_QUEUE=order_ready_queue
FRONTEND_URL=http://localhost:5173
```

#### Utils Service (`services/utils/.env`)
```env
PORT=5002
CLOUD_API_KEY=xxxx
CLOUD_NAME=xxx
CLOUD_SECRET_KEY=xxxxxx
INTERNAL_SERVICE_KEY=kdk38kd=jkkej9393039jkjkjinrian202-2=20mjjn\/kdjj
TEST_RAZORPAY_API_KEY=rzp_test_xxxxxx
TEST_RAZORPAY_KEY_SECRET=xxxxxxxx
RABBITMQ_URL=amqp://admin:admin123@localhost:5672
PAYMENT_QUEUE=payment_event
EMAIL_QUEUE=email_queue
OTP_QUEUE=otp_queue
RESTAURANT_SERVICE=http://localhost:5001
GMAIL_USER=xxxxxxxxxx
GMAIL_APP_PASSWORD=xxxxxxxxxxxx
```

#### Verification Service (`services/verificationService/.env`)
```env
PORT=5007
MONGO_URI=xxxxxx
INTERNAL_SERVICE_KEY=kdk38kd=jkkej9393039jkjkjinrian202-2=20mjjn\/kdjj
RABBITMQ_URL=amqp://admin:admin123@localhost:5672
OTP_QUEUE=otp_queue
AUTH_SERVICE=http://localhost:5000
MYDOMAIN=http://localhost:5173
```

#### Frontend (`frontend/.env`)
```env
VITE_INTERNAL_SERVICE_KEY=kdk38kd=jkkej9393039jkjkjinrian202-2=20mjjn\/kdjj
VITE_REDIRECT_URL=http://localhost:5173/login
```

### 3. Start Services

Then, move into each microservice directory (and the frontend directory), install the dependencies, and start the development server:

```bash
# Inside each service/frontend folder:
npm install
npm run dev
```

Once all services are running, you're all set!


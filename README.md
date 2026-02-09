# 🌴 CocoConnect – Smart Coconut Industry Ecosystem

CocoConnect is a **web-based digital ecosystem** designed to modernize and empower **Sri Lanka’s entire coconut industry**.
It goes beyond coconut selling to cover the **full value chain**, including coconuts, by-products (oil, husk, shell, fiber, fertilizer), investments, idea sharing, and transparent transactions.

The platform connects **farmers, producers, investors, idea creators, distributors, and administrators** into one intelligent, transparent, and trusted ecosystem using **modern web technologies, AI concepts, and blockchain-based trust mechanisms**.

## 🚀 Key Features

### 👥 Multi-Role User System
* Farmers / Producers
* Investors
* Customers
* Idea Creators
* Administrators
* Role-based dashboards and access control

### 🛒 Marketplace & By-Product Monetization
* List and manage coconut-based products
* Supports **value-added by-products**:
  * Coconut oil
  * Coconut milk & water
  * Husk, shell, fiber, coir
  * Fertilizer & industrial by-products
* Reduces dependency on middlemen

### 💡 Idea Sharing & Innovation
* Users can publish coconut-related ideas
* AI-based **idea similarity detection**
* Encourages innovation and sustainability

### 💰 Investment Management
* Publish coconut-based investment projects
* Investors can browse and invest
* Transparent investment tracking
* Blockchain proof-of-concept for investment records

### 🔗 Blockchain-Based Transparency
* Tamper-proof investment recording
* Transparent transaction references
* Conceptual smart contract–based revenue sharing

### 🧠 AI-Powered Insights (Conceptual / Prototype Level)
* Idea similarity detection
* Future-ready design for:
  * Price prediction
  * Product recommendations
  * Market analytics

### 🛠️ Admin Dashboard
* User management
* Product monitoring
* News management
* Investment tracking
* Platform oversight

### 📰 News & Announcements
* Admin-managed news corner
* Industry updates and platform announcements

## 🧑‍💻 Technology Stack

### Frontend
* **React** (with Vite)
* **Tailwind CSS**
* Axios / Fetch API

### Backend
* **Django**
* Django REST Framework (DRF)
* Role-based authentication & authorization

### Database
* **PostgreSQL**

### Blockchain
* Blockchain **proof-of-concept**
* Investment transaction hash recording
* Conceptual smart contract workflows

### AI / ML
* Text embeddings & similarity comparison (prototype level)
* Designed for future expansion

## 🏗️ System Architecture
* Client–Server architecture
* RESTful API communication
* Modular and scalable design
* Future support for IoT integration

## 📂 Project Structure (Simplified)
cococonnect/
│
├── frontend/        # React + Vite frontend
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── services/
│
├── backend/         # Django backend
│   ├── connect/
│   ├── models/
│   ├── serializers/
│   ├── views/
│   └── urls.py
│
├── database/        # PostgreSQL
│
├── docs/            # Reports & documentation
│
└── README.md

## ⚙️ Setup & Installation

### Prerequisites
* Node.js (v18+ recommended)
* Python (v3.10+)
* PostgreSQL
* Git

### 1️⃣ Clone the Repository
git clone https://github.com/your-username/cococonnect.git
cd cococonnect

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on: http://localhost:5173


### 3️⃣ Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend will run on: http://localhost:8000

### 4️⃣ Database Setup
* Create a PostgreSQL database
* Update `settings.py` with your DB credentials
* Run migrations again if needed

## 📊 Project Status
* ✅ Core frontend modules completed
* ✅ Backend CRUD operations implemented
* ✅ Role-based dashboards integrated
* ✅ Blockchain investment proof-of-concept
* ✅ AI idea similarity module (prototype)
* 🔄 UI/UX enhancements ongoing
* 🔮 AI prediction & IoT features planned as future enhancements

## 🎯 Project Objectives
* Improve transparency in the coconut industry
* Reduce middlemen exploitation
* Enable fair trade and revenue sharing
* Promote coconut by-product monetization
* Increase investor confidence
* Support digital transformation of agriculture

## 👨‍👩‍👧‍👦 Team – Group 10
* **B.H.V. Sakithma** – Group Leader
* **N.A. Liyanage**
* **H.V.K.J. Wickramarathna**
* **P.S. Hasaranga**
* **S. Nimnadi**

**Supervisor:**
Mr. Chandana Deshapriya

## 📜 License
This project is developed as an **academic final-year project**.
All rights reserved to the project team.

## 🌱 Future Enhancements
* Full blockchain smart contract deployment
* AI-based price prediction & demand forecasting
* IoT-based farm monitoring
* Mobile application / PWA
* Payment gateway integration
* Government & export authority integrations

Just tell me 😄

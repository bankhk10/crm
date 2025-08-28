cd project-root
สร้างไฟล์ Environment:สร้างไฟล์ .env ที่ Root ของโปรเจกต์ และคัดลอกเนื้อหาจากตัวอย่างด้านล่างไปวาง:# Database Credentials
DB_ROOT_PASSWORD=your_strong_root_password
DB_NAME=crm_db
DB_USER=crm_user
DB_PASSWORD=your_strong_db_password

# JWT Secrets (เปลี่ยนเป็นค่าสุ่มที่คาดเดายาก)

JWT_SECRET=your-super-secret-key-for-jwt
JWT_REFRESH_SECRET=your-super-secret-key-for-refresh-token
การรันโปรเจกต์โปรเจกต์นี้มี 2 โหมดในการรัน: 
1: โหมดพัฒนา (Development Mode) - แนะนำโหมดนี้จะเปิดใช้งาน Hot Reloading ซึ่งเมื่อคุณแก้ไขโค้ดและบันทึก, เว็บแอปพลิเคชันจะรีเฟรชตัวเองโดยอัตโนมัติ เหมาะสำหรับการพัฒนาฟีเจอร์ใหม่ๆ 

docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build


2: โหมดใช้งานจริง (Production Mode)โหมดนี้จะจำลองสภาพแวดล้อมเหมือนตอนนำไปใช้งานจริง โดยจะสร้างแอปพลิเคชันเวอร์ชันสมบูรณ์ที่ถูก Optimize แล้ว (ไม่มี Hot Reloading)docker-compose up --build
การเข้าใช้งานFrontend: http://localhost:3000Backend API Docs (Swagger): http://localhost:3001/api

ข้อมูลสำหรับเข้าสู่ระบบเริ่มต้น

Email: admin@example.com
Password: password123

📂 โครงสร้างโปรเจกต์ (เวอร์ชันล่าสุด)project-root/
├─ backend/
│ ├─ prisma/
│ ├─ src/
│ ├─ Dockerfile
│ └─ Dockerfile.dev
├─ frontend/
│ ├─ app/
│ ├─ components/
│ ├─ context/
│ ├─ lib/
│ ├─ public/
│ ├─ Dockerfile
│ └─ Dockerfile.dev
├─ docker-compose.dev.yml
├─ docker-compose.prod.yml
├─ docker-compose.prod_rundatabaseinvm.yml
├─ .env.production.example
├─ .gitignore
├─ .nvmrc
├─ dd
└─ README.md

🛑 การหยุดโปรเจกต์หากต้องการหยุดการทำงานของ Container ทั้งหมด ให้กด Ctrl + C ใน Terminal แล้วรันคำสั่ง:docker-compose down


seed ต้องเข้าไปใน contenner

npx prisma migrate dev --name init
npx prisma db seed

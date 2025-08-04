Full-Stack CRM System (Next.js + NestJS + MySQL)ระบบจัดการลูกค้าสัมพันธ์ (Customer Relationship Management) แบบ Full-Stack ที่สร้างขึ้นด้วยเทคโนโลยีสมัยใหม่ พร้อมสำหรับการใช้งานจริงและขยายระบบในอนาคต✨ คุณสมบัติหลักAuthentication: ระบบลงทะเบียน, เข้าสู่ระบบ, ออกจากระบบ ด้วย JWT (Access Token + Refresh Token)Authorization: การควบคุมการเข้าถึงตามบทบาท (Role) และสิทธิ์ (Permission)Role & Permission: สร้างและจัดการ Role (Admin, Manager, User) และ Permission (CRUD) ได้Admin Dashboard: หน้าสำหรับผู้ดูแลระบบเพื่อจัดการข้อมูลผู้ใช้, บทบาท และสิทธิ์Data Seeding: ระบบจะสร้างข้อมูลเริ่มต้น (Admin, Roles, Permissions) ให้โดยอัตโนมัติProtected Routes: จำกัดการเข้าถึงหน้าและ API สำหรับผู้ที่มีสิทธิ์เท่านั้นAPI Documentation: เอกสาร API อัตโนมัติด้วย Swagger (เข้าถึงได้ที่ http://localhost:3001/api)🛠️ เทคโนโลยีที่ใช้Frontend: Next.js (App Router), TypeScript, Tailwind CSSBackend: NestJS, Prisma ORM, TypeScriptDatabase: MySQLContainerization: Docker & Docker Compose🚀 เริ่มต้นใช้งานสิ่งที่ต้องมีDocker DesktopNode.js (แนะนำให้ติดตั้งเพื่อ IntelliSense และการตั้งค่า Editor)ขั้นตอนการติดตั้งClone a repository:git clone <your-repository-url>
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
│ ├─ .gitignore
│ ├─ Dockerfile
│ └─ Dockerfile.dev
├─ frontend/
│ ├─ app/
│ ├─ lib/
│ ├─ public/
│ ├─ .gitignore
│ ├─ Dockerfile
│ └─ Dockerfile.dev
├─ .gitignore
├─ docker-compose.yml
├─ docker-compose.dev.yml
├─ .env
└─ README.md
🛑 การหยุดโปรเจกต์หากต้องการหยุดการทำงานของ Container ทั้งหมด ให้กด Ctrl + C ใน Terminal แล้วรันคำสั่ง:docker-compose down

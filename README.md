Full-Stack CRM System (Next.js + NestJS + MySQL)ระบบจัดการลูกค้าสัมพันธ์ (Customer Relationship Management) แบบ Full-Stack ที่สร้างขึ้นด้วยเทคโนโลยีสมัยใหม่ พร้อมสำหรับการใช้งานจริงและขยายระบบในอนาคต✨ คุณสมบัติหลักAuthentication: ระบบลงทะเบียน, เข้าสู่ระบบ, ออกจากระบบ ด้วย JWT (Access Token + Refresh Token)Authorization: การควบคุมการเข้าถึงตามบทบาท (Role) และสิทธิ์ (Permission)Role & Permission: สร้างและจัดการ Role (Admin, Manager, User) และ Permission (CRUD) ได้Admin Dashboard: หน้าสำหรับผู้ดูแลระบบเพื่อจัดการข้อมูลผู้ใช้, บทบาท และสิทธิ์Data Seeding: ระบบจะสร้างข้อมูลเริ่มต้น (Admin, Roles, Permissions) ให้โดยอัตโนมัติProtected Routes: จำกัดการเข้าถึงหน้าและ API สำหรับผู้ที่มีสิทธิ์เท่านั้นAPI Documentation: เอกสาร API อัตโนมัติด้วย Swagger (เข้าถึงได้ที่ http://localhost:3001/api)🛠️ เทคโนโลยีที่ใช้Frontend: Next.js (App Router), TypeScript, Tailwind CSSBackend: NestJS, Prisma ORM, TypeScriptDatabase: MySQLContainerization: Docker & Docker Compose🚀 เริ่มต้นใช้งาน... (เนื้อหาส่วนที่เหลือเหมือนเดิม) ...
🚀 เริ่มต้นใช้งาน


Full-Stack RBAC System (Next.js + NestJS + MySQL)ระบบจัดการสิทธิ์ผู้ใช้งาน (Role-Based Access Control) แบบ Full-Stack ที่สร้างขึ้นด้วยเทคโนโลยีสมัยใหม่ พร้อมสำหรับการใช้งานจริงและขยายระบบในอนาคต✨ คุณสมบัติหลักAuthentication: ระบบลงทะเบียน, เข้าสู่ระบบ, ออกจากระบบ ด้วย JWT (Access Token + Refresh Token)Authorization: การควบคุมการเข้าถึงตามบทบาท (Role) และสิทธิ์ (Permission) ผ่าน Guards/MiddlewareRole & Permission: สร้างและจัดการ Role (Admin, Manager, User) และ Permission (CRUD) ได้Admin Dashboard: หน้าสำหรับผู้ดูแลระบบเพื่อจัดการข้อมูลผู้ใช้, บทบาท และสิทธิ์Data Seeding: ระบบจะสร้างข้อมูลเริ่มต้น (Admin, Roles, Permissions) ให้โดยอัตโนมัติเมื่อเริ่มโปรเจกต์Protected Routes: จำกัดการเข้าถึงหน้าและ API สำหรับผู้ที่มีสิทธิ์เท่านั้นAPI Documentation: เอกสาร API อัตโนมัติด้วย Swagger (เข้าถึงได้ที่ http://localhost:3001/api)🛠️ เทคโนโลยีที่ใช้Frontend: Next.js (App Router), TypeScript, Tailwind CSSBackend: NestJS, Prisma ORM, TypeScriptDatabase: MySQLContainerization: Docker & Docker Compose🚀 เริ่มต้นใช้งานสิ่งที่ต้องมีDockerNode.js (สำหรับ IntelliSense และการพัฒนานอก Docker)ขั้นตอนการติดตั้งและรันClone a repository:git clone <your-repository-url>
cd project-root
สร้างไฟล์ Environment:สร้างไฟล์ .env ที่ Root ของโปรเจกต์ และคัดลอกเนื้อหาจากตัวอย่างด้านล่างไปวาง:# Database Credentials
DB_ROOT_PASSWORD=your_strong_root_password
DB_NAME=rbac_db
DB_USER=rbac_user
DB_PASSWORD=your_strong_db_password

# JWT Secrets (เปลี่ยนเป็นค่าสุ่มที่คาดเดายาก)
JWT_SECRET=your-super-secret-key-for-jwt
JWT_REFRESH_SECRET=your-super-secret-key-for-refresh-token
รันโปรเจกต์ด้วย Docker Compose:docker-compose up --build
คำสั่งนี้จะทำการสร้าง Image และเปิด Container ทั้งหมดขึ้นมา (อาจใช้เวลาสักครู่ในการรันครั้งแรก)เข้าใช้งาน:Frontend: http://localhost:3000Backend API Docs (Swagger): http://localhost:3001/apiข้อมูลสำหรับเข้าสู่ระบบเริ่มต้น:Email: admin@example.com Password: password123📂 โครงสร้างโปรเจกต์project-root/
├─ backend/         # NestJS Application
├─ frontend/        # Next.js Application
├─ docker-compose.yml # ไฟล์กำหนดค่า Docker
├─ .env             # ไฟล์เก็บค่า Environment Variables
└─ README.md        # คู่มือนี้
🛑 การหยุดโปรเจกต์หากต้องการหยุดการทำงานของ Container ทั้งหมด ให้กด Ctrl + C ใน Terminal แล้วรันคำสั่ง:docker-compose down

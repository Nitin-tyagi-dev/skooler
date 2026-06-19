/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new school and admin user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [schoolName, schoolCode, name, email, password]
 *             properties:
 *               schoolName: { type: string }
 *               schoolCode: { type: string }
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201: { description: School registered }
 *
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and receive JWT token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 *
 * /api/students:
 *   post:
 *     tags: [Students]
 *     summary: Create a student
 *     responses:
 *       201: { description: Student created }
 *   get:
 *     tags: [Students]
 *     summary: List active students
 *     responses:
 *       200: { description: Student list }
 *
 * /api/students/{id}:
 *   put:
 *     tags: [Students]
 *     summary: Update a student
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Student updated }
 *   delete:
 *     tags: [Students]
 *     summary: Deactivate a student
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Student deactivated }
 *
 * /api/students/{id}/photo:
 *   post:
 *     tags: [Students]
 *     summary: Upload student photo
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200: { description: Photo uploaded }
 *
 * /api/teachers:
 *   post:
 *     tags: [Teachers]
 *     summary: Create a teacher
 *     responses:
 *       201: { description: Teacher created }
 *   get:
 *     tags: [Teachers]
 *     summary: List active teachers
 *     responses:
 *       200: { description: Teacher list }
 *
 * /api/teachers/{id}:
 *   get:
 *     tags: [Teachers]
 *     summary: Get teacher by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Teacher details }
 *   put:
 *     tags: [Teachers]
 *     summary: Update a teacher
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Teacher updated }
 *   delete:
 *     tags: [Teachers]
 *     summary: Deactivate a teacher
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Teacher deactivated }
 *
 * /api/subjects:
 *   post:
 *     tags: [Subjects]
 *     summary: Create a subject
 *     responses:
 *       201: { description: Subject created }
 *   get:
 *     tags: [Subjects]
 *     summary: List subjects
 *     parameters:
 *       - in: query
 *         name: className
 *         schema: { type: string }
 *     responses:
 *       200: { description: Subject list }
 *
 * /api/subjects/{id}:
 *   get:
 *     tags: [Subjects]
 *     summary: Get subject by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Subject details }
 *   put:
 *     tags: [Subjects]
 *     summary: Update a subject
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Subject updated }
 *   delete:
 *     tags: [Subjects]
 *     summary: Deactivate a subject
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Subject deactivated }
 *
 * /api/attendance/mark:
 *   post:
 *     tags: [Attendance]
 *     summary: Mark attendance for a class
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date, className, section, records]
 *             properties:
 *               date: { type: string, format: date }
 *               className: { type: string }
 *               section: { type: string }
 *               records:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     studentId: { type: string }
 *                     status:
 *                       type: string
 *                       enum: [present, absent, late, half_day]
 *     responses:
 *       201: { description: Attendance marked }
 *
 * /api/attendance/student/{studentId}:
 *   get:
 *     tags: [Attendance]
 *     summary: Get student attendance history
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: month
 *         schema: { type: integer }
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Attendance records }
 *
 * /api/attendance/class/{className}/{date}:
 *   get:
 *     tags: [Attendance]
 *     summary: Get class attendance report for a date
 *     parameters:
 *       - in: path
 *         name: className
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: date
 *         required: true
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: section
 *         schema: { type: string }
 *     responses:
 *       200: { description: Class attendance report }
 *
 * /api/results:
 *   post:
 *     tags: [Results]
 *     summary: Create student result with grade calculation
 *     responses:
 *       201: { description: Result created }
 *
 * /api/results/{id}:
 *   put:
 *     tags: [Results]
 *     summary: Update student result and recalculate grades
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Result updated }
 *
 * /api/results/{id}/pdf:
 *   get:
 *     tags: [Results]
 *     summary: Download result PDF report card
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: PDF file }
 *
 * /api/fees/structure:
 *   post:
 *     tags: [Fees]
 *     summary: Create fee structure
 *     responses:
 *       201: { description: Fee structure created }
 *
 * /api/fees/payment:
 *   post:
 *     tags: [Fees]
 *     summary: Record a fee payment
 *     responses:
 *       200: { description: Payment recorded }
 *
 * /api/fees/ledger/{studentId}/{academicYear}:
 *   get:
 *     tags: [Fees]
 *     summary: Get student fee ledger
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: academicYear
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Fee ledger }
 *
 * /api/fees/dashboard/{academicYear}:
 *   get:
 *     tags: [Fees]
 *     summary: Financial dashboard
 *     parameters:
 *       - in: path
 *         name: academicYear
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Financial summary }
 *
 * /api/fees/pending/{academicYear}:
 *   get:
 *     tags: [Fees]
 *     summary: List students with pending fees
 *     parameters:
 *       - in: path
 *         name: academicYear
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Pending fee list }
 *
 * /api/fees/refund:
 *   post:
 *     tags: [Fees]
 *     summary: Process a fee refund
 *     responses:
 *       200: { description: Refund processed }
 *
 * /api/dashboard/{academicYear}:
 *   get:
 *     tags: [Dashboard]
 *     summary: Admin dashboard analytics
 *     parameters:
 *       - in: path
 *         name: academicYear
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Dashboard metrics }
 *
 * /api/school:
 *   get:
 *     tags: [School]
 *     summary: Get school profile
 *     responses:
 *       200: { description: School profile }
 *
 * /api/school/logo:
 *   put:
 *     tags: [School]
 *     summary: Upload school logo
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200: { description: Logo uploaded }
 */

export default {};

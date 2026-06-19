import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Skooler API",
      version: "1.0.0",
      description:
        "School management system API with JWT auth, role-based access, and multi-tenant school isolation.",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "Auth" },
      { name: "Students" },
      { name: "Teachers" },
      { name: "Subjects" },
      { name: "Attendance" },
      { name: "Results" },
      { name: "Fees" },
      { name: "Dashboard" },
      { name: "School" },
    ],
  },
  apis: ["./src/routes/*.js", "./src/config/swagger.paths.js"],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;

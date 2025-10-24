const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Debug: Show environment configuration
console.log("🔧 Environment Configuration:");
console.log("📊 NODE_ENV:", process.env.NODE_ENV || "development");
console.log("🚪 PORT:", process.env.PORT || 5009);
console.log(
  "🌐 FRONTEND_URL:",
  process.env.FRONTEND_URL || "http://localhost:3009"
);
console.log(
  "🗄️  MONGODB_URI:",
  process.env.MONGODB_URI ? "***configured***" : "***using default***"
);

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const forgotPasswordRoutes = require("./routes/forgotPassword");
const emailVerificationRoutes = require("./routes/emailVerification");
const dashboardRoutes = require("./routes/dashboard");
const auditRoutes = require("./routes/audit");
const uploadRoutes = require("./routes/upload");
const settingsRoutes = require("./routes/settings");
const organisationRoutes = require("./routes/organisations");
const settingsManager = require("./utils/settingsManager");
const { auditMiddleware } = require("./middleware/audit");

const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:", "http://localhost:5009", "https://NPST-uploads.s3.eu-west-2.amazonaws.com", "https://NPST-uploads.s3.amazonaws.com", "*"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "http://localhost:5009"],
      },
    },
    crossOriginResourcePolicy: false,
  })
);

// Rate limiting - Disabled in development
if (process.env.NODE_ENV === "production") {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);
  console.log("🛡️  Rate limiting enabled for production");
} else {
  console.log("🚀 Rate limiting disabled for development");
}

// CORS configuration
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3009",
      "http://localhost:3009"
    ],
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Trust proxy for accurate IP addresses in audit logs
app.set("trust proxy", true);

// Static file serving removed - now using AWS S3 for file storage

// Logging middleware
app.use(morgan("combined"));

// Trust proxy for accurate IP addresses in audit logs
app.set("trust proxy", true);

// Audit middleware for all API routes
app.use("/api/*", auditMiddleware());

// MongoDB connection
const mongoUri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/NPST";
console.log("🔗 Connecting to MongoDB...");
console.log("📍 Database URI:", mongoUri);

mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    console.log("🌐 Database Host:", mongoose.connection.host);
    console.log("🗄️  Database Name:", mongoose.connection.name);
    console.log("🔌 Database Port:", mongoose.connection.port);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    console.error("🔗 Failed to connect to:", mongoUri);
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api", forgotPasswordRoutes);
app.use("/api/email-verification", emailVerificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/organisations", organisationRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "New Project Starter Template API is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    const validationErrors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validationErrors,
    });
  }

  // Handle duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${
        field.charAt(0).toUpperCase() + field.slice(1)
      } already exists`,
    });
  }

  // Handle cast errors (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
  }

  // Generic server error
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5009;

// Start server and load settings
const startServer = async () => {
  try {
    // Load settings on startup
    await settingsManager.loadSettings();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(
        `🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3009"}`
      );
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

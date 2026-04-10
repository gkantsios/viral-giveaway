import fs from "fs";
import path from "path";

/**
 * Initialize the database directory and ensure SQLite file path is valid
 */
export async function initializeDatabase() {
  try {
    const databaseUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";

    // Extract file path from DATABASE_URL
    // Format: file:./relative/path or file:/absolute/path
    let filePath: string;
    if (databaseUrl.startsWith("file:")) {
      filePath = databaseUrl.substring(5); // Remove "file:" prefix
    } else {
      filePath = databaseUrl;
    }

    // Convert relative paths to absolute
    if (!path.isAbsolute(filePath)) {
      filePath = path.join(process.cwd(), filePath);
    }

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created database directory: ${dir}`);
    }

    // Log initialization info
    console.log("Database initialization:", {
      databaseUrl: process.env.DATABASE_URL,
      filePath: filePath,
      exists: fs.existsSync(filePath),
      dirExists: fs.existsSync(dir),
      nodeEnv: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error("Database directory initialization failed:", error);
  }
}

// Initialize on module load
initializeDatabase().catch(console.error);

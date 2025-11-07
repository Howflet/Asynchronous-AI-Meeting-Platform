import { initDb, db } from "./src/db.js";

console.log("Checking database schema...");

// Initialize the database
initDb();

// Check personas table schema
console.log("\nPersonas table columns:");
const columns = db.pragma("table_info(personas)");

columns.forEach(col => {
  console.log(`- ${col.name}: ${col.type}${col.notnull ? ' NOT NULL' : ''}`);
});

// Check if we have both 'mcp' and 'config' columns
const hasMcpColumn = columns.some((col) => col.name === 'mcp');
const hasConfigColumn = columns.some((col) => col.name === 'config');

console.log(`\nColumn status:`);
console.log(`- Has 'mcp' column: ${hasMcpColumn}`);
console.log(`- Has 'config' column: ${hasConfigColumn}`);

if (hasMcpColumn && hasConfigColumn) {
  console.log("\nWARNING: Both 'mcp' and 'config' columns exist! This needs manual cleanup.");
} else if (hasMcpColumn && !hasConfigColumn) {
  console.log("\nMigration needed: Will rename 'mcp' to 'config'");
} else if (!hasMcpColumn && hasConfigColumn) {
  console.log("\nSchema is correct: Using 'config' column");
} else {
  console.log("\nERROR: Neither column exists!");
}

// Close database
db.close();
console.log("\nDatabase check completed.");
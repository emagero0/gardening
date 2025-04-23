import mysql from 'mysql2/promise';
import { dbConfig } from './config';

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Test the connection
pool.getConnection()
  .then(connection => {
    console.log('Successfully connected to the MySQL database.');
    connection.release(); // Release the connection back to the pool
  })
  .catch(error => {
    console.error('Error connecting to the MySQL database:', error);
    // Exit the process if the database connection fails on startup
    process.exit(1);
  });

// Export the pool for use in other modules
export default pool;

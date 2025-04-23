// Use environment variables in a real application
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root', // Replace with your MySQL username
  password: process.env.DB_PASSWORD || '229T$8t6', // Replace with your MySQL password
  database: process.env.DB_NAME || 'vertical_garden_db', // Replace with your database name
  waitForConnections: true,
  connectionLimit: 10, // Adjust as needed
  queueLimit: 0
};

export const serverConfig = {
  port: process.env.PORT || 3001
};

import express, { Request, Response, RequestHandler } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import cors from 'cors';
import { serverConfig } from './config';
import pool from './db';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = serverConfig.port; // Use port from config

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// --- WebSocket Connection Handling ---
wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');

  // Send a welcome message
  ws.send(JSON.stringify({ type: 'info', message: 'Welcome to the Vertical Garden WebSocket server!' }));

  ws.on('message', (message: Buffer) => {
    console.log('Received:', message.toString());
    // Handle incoming messages from clients if needed (e.g., control commands)
    try {
      const parsedMessage = JSON.parse(message.toString());
      // Example: Echo back the message
      // ws.send(JSON.stringify({ type: 'echo', payload: parsedMessage }));

      // TODO: Handle specific commands like irrigation toggle
      if (parsedMessage.type === 'control' && parsedMessage.action === 'toggle_irrigation') {
        console.log('Received irrigation toggle command:', parsedMessage.payload);
        // Here you would interact with the ESP32 or database
        // For now, just broadcast the intended state change
        broadcast({ type: 'irrigation_state', status: parsedMessage.payload.status });
      }

    } catch (error) {
      console.error('Failed to parse message or invalid message format:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Function to broadcast messages to all connected clients
const broadcast = (data: any) => {
  const messageString = JSON.stringify(data);
  console.log('Broadcasting:', messageString);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageString);
    }
  });
};

// --- HTTP Routes ---

// Endpoint for ESP32 to post sensor data
const sensorDataHandler: RequestHandler = (req, res) => {
  const sensorData = req.body;
  console.log('Received sensor data from ESP32:', sensorData);

  // Basic validation (expand as needed)
  // Assuming ESP32 sends data like: { type: 'moisture', id: 'A', value: 55.2 }
  // Or: { type: 'dht11', temp: 22.1, humidity: 65.3 }
  // Or: { type: 'npk', n: 10, p: 20, k: 30 }
  if (!sensorData || !sensorData.type) {
    res.status(400).json({ message: 'Invalid sensor data format' });
    return; // End execution here
  }

  const timestamp = new Date(); // Use server time for consistency
  let sql = '';
  let params: any[] = [];

    // Adapt SQL based on sensor type
    switch (sensorData.type) {
      case 'moisture':
        if (sensorData.id && typeof sensorData.value === 'number') {
          sql = 'INSERT INTO sensor_readings (timestamp, sensor_type, sensor_id, value_1) VALUES (?, ?, ?, ?)';
          params = [timestamp, sensorData.type, sensorData.id, sensorData.value];
        }
        break;
      case 'dht11':
        if (typeof sensorData.temp === 'number' && typeof sensorData.humidity === 'number') {
          sql = 'INSERT INTO sensor_readings (timestamp, sensor_type, value_1, value_2) VALUES (?, ?, ?, ?)';
          params = [timestamp, sensorData.type, sensorData.temp, sensorData.humidity];
        }
        break;
      case 'npk':
         if (typeof sensorData.n === 'number' && typeof sensorData.p === 'number' && typeof sensorData.k === 'number') {
          // Storing NPK might need a different table or structure, here we store N in value_1, P in value_2 for simplicity
          // A better approach might be separate columns or a JSON column if supported/desired.
          sql = 'INSERT INTO sensor_readings (timestamp, sensor_type, value_1, value_2, value_3) VALUES (?, ?, ?, ?, ?)'; // Assuming value_3 exists for K
          params = [timestamp, sensorData.type, sensorData.n, sensorData.p, sensorData.k];
         }
        break;
      // Add other sensor types if needed
      default:
        console.warn(`Received unknown sensor type: ${sensorData.type}`);
        // Optionally store unknown types or handle differently
        break;
    }

    if (sql && params.length > 0) {
      pool.query(sql, params)
        .then(() => {
          console.log('Sensor data inserted into database.');
          // Broadcast the received data to all WebSocket clients AFTER successful DB insertion
          broadcast({ type: 'sensor_update', payload: { ...sensorData, timestamp } }); // Include server timestamp
          res.status(200).json({ message: 'Data received and stored successfully' });
        })
        .catch(error => {
          console.error('Error inserting sensor data into database:', error);
          res.status(500).json({ message: 'Failed to store sensor data' });
        });
    } else if (sensorData.type) {
       // Known type but invalid data for insertion
       console.warn(`Invalid data for sensor type ${sensorData.type}:`, sensorData);
       res.status(400).json({ message: `Invalid data provided for sensor type ${sensorData.type}` });
    } else {
       // Unknown type was handled above, just respond
       res.status(200).json({ message: 'Data received but not stored (unknown type)' });
    }
};

app.post('/api/sensor-data', sensorDataHandler);

// Simple health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Endpoint to fetch historical sensor data
app.get('/api/sensor-history', async (req: Request, res: Response) => {
  try {
    // Basic query: fetch all data, ordered by time descending.
    // Add filtering (WHERE clauses based on req.query) and pagination later if needed.
    const sql = 'SELECT * FROM sensor_readings ORDER BY timestamp DESC LIMIT 1000'; // Limit results for now
    const [rows] = await pool.query(sql);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching sensor history:', error);
    res.status(500).json({ message: 'Failed to fetch sensor history' });
  }
});


// --- Server Startup ---
server.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`WebSocket server is listening on ws://localhost:${PORT}`);
});

// Example: Simulate broadcasting sensor data every 10 seconds
// setInterval(() => {
//   const simulatedData = {
//     timestamp: new Date().toISOString(),
//     moistureA: Math.random() * 100,
//     moistureB: Math.random() * 100,
//     temperature: 20 + Math.random() * 10,
//     humidity: 40 + Math.random() * 30,
//     nitrogen: Math.random() * 50,
//     phosphorus: Math.random() * 50,
//     potassium: Math.random() * 50,
//   };
//   broadcast({ type: 'sensor_update', payload: simulatedData });
// }, 10000);

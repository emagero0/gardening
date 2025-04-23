// Updated interface to match data structure passed from History.tsx
interface ExportData {
  timestamp: string; // Formatted timestamp string
  temperature: number | null;
  humidity: number | null;
  moistureA: number | null;
  moistureB: number | null;
  nitrogen: number | null;
  phosphorus: number | null;
  potassium: number | null;
}

// Keep formatDate as it's used for display, not the raw timestamp
// const formatDate = (timestamp: string): string => {
//   const date = new Date(timestamp);
//   return date.toLocaleString();
// };

// Helper to format numbers or return empty string for null/undefined
const formatValue = (value: number | null | undefined, precision: number = 1): string => {
  return typeof value === 'number' ? value.toFixed(precision) : '';
};

export const exportToCSV = (data: ExportData[]): void => {
  // Updated CSV Headers
  const headers = [
    'Timestamp',
    'Temperature (°C)',
    'Humidity (%)',
    'Moisture A (%)', // Updated
    'Moisture B (%)', // Added
    'Nitrogen (ppm)',
    'Phosphorus (ppm)',
    'Potassium (ppm)'
  ];

  // Updated data rows mapping
  const rows = data.map(point => [
    point.timestamp, // Already formatted in History.tsx
    formatValue(point.temperature),
    formatValue(point.humidity),
    formatValue(point.moistureA), // Updated
    formatValue(point.moistureB), // Added
    formatValue(point.nitrogen),
    formatValue(point.phosphorus),
    formatValue(point.potassium)
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create and trigger download (logic remains the same)
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `sensor-data-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Update type hint for exportToJSON
export const exportToJSON = (data: ExportData[]): void => {
  // Data passed from History.tsx already has formatted timestamp and flattened NPK
  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: 'application/json' }
  );
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `sensor-data-${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

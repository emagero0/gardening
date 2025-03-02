interface ExportData {
  timestamp: string;
  temperature: number;
  humidity: number;
  moisture: number;
  npk: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
}

const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

export const exportToCSV = (data: ExportData[]): void => {
  // CSV Headers
  const headers = [
    'Timestamp',
    'Temperature (°C)',
    'Humidity (%)',
    'Moisture (%)',
    'Nitrogen (ppm)',
    'Phosphorus (ppm)',
    'Potassium (ppm)'
  ];

  // Format data rows
  const rows = data.map(point => [
    formatDate(point.timestamp),
    point.temperature.toFixed(1),
    point.humidity.toFixed(1),
    point.moisture.toFixed(1),
    point.npk.nitrogen.toFixed(1),
    point.npk.phosphorus.toFixed(1),
    point.npk.potassium.toFixed(1)
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create and trigger download
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

export const exportToJSON = (data: ExportData[]): void => {
  const formattedData = data.map(point => ({
    ...point,
    timestamp: formatDate(point.timestamp)
  }));

  const blob = new Blob(
    [JSON.stringify(formattedData, null, 2)],
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

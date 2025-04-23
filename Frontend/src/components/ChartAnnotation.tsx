import React from 'react';
import { Label, ReferenceLine } from 'recharts';

interface Event {
  timestamp: string;
  type: 'watering' | 'fertilization' | 'maintenance';
  description: string;
}

interface Props {
  events: Event[];
  yAxisId?: string;
  position?: 'top' | 'bottom';
}

const EVENT_COLORS = {
  watering: '#3B82F6',     // Blue
  fertilization: '#10B981', // Green
  maintenance: '#F59E0B'    // Amber
};

const EVENT_ICONS = {
  watering: '💧',
  fertilization: '🌱',
  maintenance: '🔧'
};

export const ChartAnnotation: React.FC<Props> = ({ 
  events, 
  yAxisId, 
  position = 'top' 
}) => {
  if (!events?.length) return null;

  return (
    <>
      {events.map((event, index) => (
        <ReferenceLine
          key={`${event.timestamp}-${index}`}
          x={event.timestamp}
          yAxisId={yAxisId}
          stroke={EVENT_COLORS[event.type]}
          strokeDasharray="3 3"
          strokeWidth={2}
          label={
            <Label
              value={`${EVENT_ICONS[event.type]} ${event.description}`}
              position={position}
              offset={10}
              fill={EVENT_COLORS[event.type]}
              fontSize={12}
            />
          }
        />
      ))}
    </>
  );
};

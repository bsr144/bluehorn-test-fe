export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface ClockEntry {
  timestamp: string;
  latitude: number;
  longitude: number;
}

export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'completed' | 'not-completed';
  reason?: string;
}

export interface Schedule {
  id: string;
  employeeId?: string;
  caregiverName?: string;
  clientName: string;
  date: string;
  startTime: string;
  endTime: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  status: 'upcoming' | 'in-progress' | 'completed' | 'missed';
  clockIn?: ClockEntry;
  clockOut?: ClockEntry;
  tasks: Task[];
}

export interface ScheduleStats {
  total: number;
  missed: number;
  upcoming: number;
  inProgress: number;
  completed: number;
}

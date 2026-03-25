import type { Schedule, Task, ScheduleStats } from '../types';



interface BEScheduleResponse {
  id: number;
  employee_id: string;
  caregiver_name: string;
  patient_name: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  clock_in_time: string | null;
  clock_in_lat: number | null;
  clock_in_lng: number | null;
  clock_out_time: string | null;
  clock_out_lat: number | null;
  clock_out_lng: number | null;
  location: string;
  created_at: string;
  updated_at: string;
}

interface BETaskResponse {
  id: number;
  schedule_id: number;
  description: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface BEScheduleListResponse {
  data: BEScheduleResponse[];
  stats: {
    total: number;
    upcoming: number;
    in_progress: number;
    completed: number;
    missed: number;
  };
}

interface BEScheduleDetailResponse {
  schedule: BEScheduleResponse;
  tasks: BETaskResponse[];
}

interface BEErrorDetail {
  code: string;
  message: string;
  fields?: Array<{ field: string; message: string }>;
}

interface BEEnvelope<T> {
  success: boolean;
  data: T;
  error?: BEErrorDetail | string;
  request_id?: string;
}



function mapScheduleStatus(beStatus: string): Schedule['status'] {
  if (beStatus === 'in_progress') return 'in-progress';
  return beStatus as Schedule['status'];
}

function mapTaskStatus(beStatus: string): Task['status'] {
  if (beStatus === 'not_completed') return 'not-completed';
  return beStatus as Task['status'];
}

export function mapStatusToBE(feStatus: string): string {
  if (feStatus === 'in-progress') return 'in_progress';
  if (feStatus === 'not-completed') return 'not_completed';
  return feStatus;
}



function adaptTask(be: BETaskResponse): Task {
  return {
    id: String(be.id),
    title: be.description,
    status: mapTaskStatus(be.status),
    reason: be.notes || undefined,
  };
}

function adaptSchedule(be: BEScheduleResponse, beTasks?: BETaskResponse[]): Schedule {
  return {
    id: String(be.id),
    employeeId: be.employee_id || undefined,
    caregiverName: be.caregiver_name || undefined,
    clientName: be.patient_name,
    date: be.date,
    startTime: be.start_time,
    endTime: be.end_time,
    status: mapScheduleStatus(be.status),
    location: {
      address: be.location,
      latitude: 0,
      longitude: 0,
    },
    clockIn: be.clock_in_time
      ? {
          timestamp: be.clock_in_time,
          latitude: be.clock_in_lat ?? 0,
          longitude: be.clock_in_lng ?? 0,
        }
      : undefined,
    clockOut: be.clock_out_time
      ? {
          timestamp: be.clock_out_time,
          latitude: be.clock_out_lat ?? 0,
          longitude: be.clock_out_lng ?? 0,
        }
      : undefined,
    tasks: beTasks ? beTasks.map(adaptTask) : [],
  };
}



function unwrap<T>(envelope: BEEnvelope<T>): T {
  if (!envelope.success) {
    if (typeof envelope.error === 'object' && envelope.error) {
      const { message, fields } = envelope.error;
      if (fields?.length) {
        throw new Error(`${message}: ${fields.map((f) => `${f.field} – ${f.message}`).join(', ')}`);
      }
      throw new Error(message);
    }
    throw new Error(String(envelope.error) || 'API request failed');
  }
  return envelope.data;
}



export function adaptScheduleList(responseData: BEEnvelope<BEScheduleListResponse>): Schedule[] {
  const inner = unwrap(responseData);
  return inner.data.map((s) => adaptSchedule(s));
}

export function adaptScheduleDetail(responseData: BEEnvelope<BEScheduleDetailResponse>): Schedule {
  const inner = unwrap(responseData);
  return adaptSchedule(inner.schedule, inner.tasks);
}



interface BEStatsResponse {
  total: number;
  missed: number;
  upcoming: number;
  in_progress: number;
  completed: number;
}

export function adaptStats(responseData: BEEnvelope<BEStatsResponse>): ScheduleStats {
  const inner = unwrap(responseData);
  return {
    total: inner.total,
    missed: inner.missed,
    upcoming: inner.upcoming,
    inProgress: inner.in_progress,
    completed: inner.completed,
  };
}



export function adaptCreatedSchedule(responseData: BEEnvelope<BEScheduleResponse>): Schedule {
  const inner = unwrap(responseData);
  return adaptSchedule(inner);
}

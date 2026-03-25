import type { Schedule, GeoLocation, ScheduleStats } from '../types';
import { apiClient, isUsingMockApi } from './client';
import { initialMockSchedules } from './mockData';
import { adaptScheduleList, adaptScheduleDetail, adaptStats, adaptCreatedSchedule, mapStatusToBE } from './adapters';
import { getLocalToday } from '../utils/date';

const STORAGE_KEY = 'evv_schedules';

function getMockSchedules(): Schedule[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockSchedules));
  return initialMockSchedules;
}

function saveMockSchedules(schedules: Schedule[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
}

function updateMockSchedule(id: string, updater: (s: Schedule) => Schedule): Schedule {
  const schedules = getMockSchedules();
  const idx = schedules.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error('Schedule not found');
  schedules[idx] = updater(schedules[idx]);
  saveMockSchedules(schedules);
  return schedules[idx];
}



export async function fetchSchedules(): Promise<Schedule[]> {
  if (isUsingMockApi) return getMockSchedules();
  const { data } = await apiClient.get('/schedules');
  return adaptScheduleList(data);
}

export async function fetchTodaySchedules(): Promise<Schedule[]> {
  if (isUsingMockApi) {
    const today = getLocalToday();
    return getMockSchedules().filter((s) => s.date === today);
  }
  const today = getLocalToday();
  const { data } = await apiClient.get(`/schedules`, { params: { date: today } });
  return adaptScheduleList(data);
}

export async function fetchScheduleById(id: string): Promise<Schedule> {
  if (isUsingMockApi) {
    const schedule = getMockSchedules().find((s) => s.id === id);
    if (!schedule) throw new Error('Schedule not found');
    return schedule;
  }
  const { data } = await apiClient.get(`/schedules/${id}`);
  return adaptScheduleDetail(data);
}

export async function fetchStats(): Promise<ScheduleStats> {
  if (isUsingMockApi) {
    const schedules = getMockSchedules();
    const today = getLocalToday();
    const todaySchedules = schedules.filter((s) => s.date === today);
    return {
      total: todaySchedules.length,
      missed: schedules.filter((s) => s.status === 'missed').length,
      upcoming: todaySchedules.filter((s) => s.status === 'upcoming').length,
      inProgress: todaySchedules.filter((s) => s.status === 'in-progress').length,
      completed: todaySchedules.filter((s) => s.status === 'completed').length,
    };
  }
  const { data } = await apiClient.get('/schedules/stats');
  return adaptStats(data);
}

export async function checkHealth(): Promise<boolean> {
  if (isUsingMockApi) return true;
  try {
    const { data } = await apiClient.get('/health');
    const status = data?.data?.status ?? data?.status;
    return status === 'ok';
  } catch {
    return false;
  }
}



export interface CreateScheduleInput {
  employeeId: string;
  caregiverName: string;
  patientName: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
}

export async function createSchedule(input: CreateScheduleInput): Promise<Schedule> {
  if (isUsingMockApi) {
    const schedules = getMockSchedules();
    const newSchedule: Schedule = {
      id: String(Date.now()),
      employeeId: input.employeeId,
      clientName: input.patientName,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      location: { address: input.location, latitude: 0, longitude: 0 },
      status: 'upcoming',
      tasks: [],
    };
    saveMockSchedules([...schedules, newSchedule]);
    return newSchedule;
  }
  const { data } = await apiClient.post('/schedules', {
    employee_id: input.employeeId,
    caregiver_name: input.caregiverName,
    patient_name: input.patientName,
    date: input.date,
    start_time: input.startTime,
    end_time: input.endTime,
    location: input.location,
  });
  return adaptCreatedSchedule(data);
}

export async function createTask(scheduleId: string, description: string): Promise<Schedule> {
  if (isUsingMockApi) {
    return updateMockSchedule(scheduleId, (s) => ({
      ...s,
      tasks: [
        ...s.tasks,
        { id: `t${Date.now()}`, title: description, status: 'pending' as const },
      ],
    }));
  }
  await apiClient.post(`/schedules/${scheduleId}/tasks`, { description });
  return fetchScheduleById(scheduleId);
}

export async function startVisit(id: string, location: GeoLocation): Promise<Schedule> {
  if (isUsingMockApi) {
    return updateMockSchedule(id, (s) => ({
      ...s,
      status: 'in-progress',
      clockIn: {
        timestamp: new Date().toISOString(),
        latitude: location.latitude,
        longitude: location.longitude,
      },
    }));
  }
  await apiClient.patch(`/schedules/${id}`, {
    clock_in_time: new Date().toISOString(),
    clock_in_lat: location.latitude,
    clock_in_lng: location.longitude,
  });
  return fetchScheduleById(id);
}

export async function endVisit(id: string, location: GeoLocation): Promise<Schedule> {
  if (isUsingMockApi) {
    return updateMockSchedule(id, (s) => ({
      ...s,
      status: 'completed',
      clockOut: {
        timestamp: new Date().toISOString(),
        latitude: location.latitude,
        longitude: location.longitude,
      },
    }));
  }
  await apiClient.patch(`/schedules/${id}`, {
    clock_out_time: new Date().toISOString(),
    clock_out_lat: location.latitude,
    clock_out_lng: location.longitude,
  });
  return fetchScheduleById(id);
}

export async function updateTaskStatus(
  scheduleId: string,
  taskId: string,
  status: 'completed' | 'not-completed',
  reason?: string
): Promise<Schedule> {
  if (isUsingMockApi) {
    return updateMockSchedule(scheduleId, (s) => ({
      ...s,
      tasks: s.tasks.map((t) =>
        t.id === taskId ? { ...t, status, reason: status === 'not-completed' ? reason : undefined } : t
      ),
    }));
  }
  await apiClient.patch(`/schedules/${scheduleId}/tasks/${taskId}`, {
    status: mapStatusToBE(status),
    notes: reason,
  });
  return fetchScheduleById(scheduleId);
}

export async function deleteSchedule(id: string): Promise<void> {
  if (isUsingMockApi) {
    const schedules = getMockSchedules().filter((s) => s.id !== id);
    saveMockSchedules(schedules);
    return;
  }
  await apiClient.delete(`/schedules/${id}`);
}

export async function deleteTask(scheduleId: string, taskId: string): Promise<void> {
  if (isUsingMockApi) {
    updateMockSchedule(scheduleId, (s) => ({
      ...s,
      tasks: s.tasks.filter((t) => t.id !== taskId),
    }));
    return;
  }
  await apiClient.delete(`/schedules/${scheduleId}/tasks/${taskId}`);
}

export function resetMockData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

import type { Schedule } from '../types';
import { getLocalToday, getLocalYesterday } from '../utils/date';

const today = getLocalToday();
const yesterday = getLocalYesterday();

export const initialMockSchedules: Schedule[] = [
  {
    id: '1',
    clientName: 'Dorothy Johnson',
    date: today,
    startTime: '08:00',
    endTime: '10:00',
    location: {
      address: '123 Elm Street, Springfield, IL',
      latitude: 39.7817,
      longitude: -89.6501,
    },
    status: 'completed',
    clockIn: {
      timestamp: `${today}T08:02:00Z`,
      latitude: 39.7817,
      longitude: -89.6501,
    },
    clockOut: {
      timestamp: `${today}T09:55:00Z`,
      latitude: 39.7817,
      longitude: -89.6501,
    },
    tasks: [
      { id: 't1', title: 'Check vital signs', status: 'completed' },
      { id: 't2', title: 'Administer morning medication', status: 'completed' },
      { id: 't3', title: 'Assist with breakfast', status: 'completed' },
    ],
  },
  {
    id: '2',
    clientName: 'Robert Williams',
    date: today,
    startTime: '11:00',
    endTime: '13:00',
    location: {
      address: '456 Oak Avenue, Springfield, IL',
      latitude: 39.79,
      longitude: -89.644,
    },
    status: 'upcoming',
    tasks: [
      { id: 't4', title: 'Assist with bathing', status: 'pending' },
      { id: 't5', title: 'Give medication', status: 'pending' },
      { id: 't6', title: 'Prepare lunch', status: 'pending' },
      { id: 't7', title: 'Light housekeeping', status: 'pending' },
    ],
  },
  {
    id: '3',
    clientName: 'Margaret Davis',
    date: today,
    startTime: '14:00',
    endTime: '16:00',
    location: {
      address: '789 Pine Road, Springfield, IL',
      latitude: 39.775,
      longitude: -89.66,
    },
    status: 'upcoming',
    tasks: [
      { id: 't8', title: 'Physical therapy exercises', status: 'pending' },
      { id: 't9', title: 'Wound care', status: 'pending' },
      { id: 't10', title: 'Companionship and conversation', status: 'pending' },
    ],
  },
  {
    id: '4',
    clientName: 'James Wilson',
    date: today,
    startTime: '07:00',
    endTime: '09:00',
    location: {
      address: '321 Maple Drive, Springfield, IL',
      latitude: 39.785,
      longitude: -89.655,
    },
    status: 'missed',
    tasks: [
      { id: 't11', title: 'Morning hygiene routine', status: 'pending' },
      { id: 't12', title: 'Breakfast preparation', status: 'pending' },
    ],
  },
  {
    id: '5',
    clientName: 'Susan Martinez',
    date: yesterday,
    startTime: '10:00',
    endTime: '12:00',
    location: {
      address: '555 Cedar Lane, Springfield, IL',
      latitude: 39.788,
      longitude: -89.648,
    },
    status: 'completed',
    clockIn: {
      timestamp: `${yesterday}T10:05:00Z`,
      latitude: 39.788,
      longitude: -89.648,
    },
    clockOut: {
      timestamp: `${yesterday}T11:50:00Z`,
      latitude: 39.788,
      longitude: -89.648,
    },
    tasks: [
      { id: 't13', title: 'Administer insulin', status: 'completed' },
      { id: 't14', title: 'Blood sugar monitoring', status: 'completed' },
      {
        id: 't15',
        title: 'Meal preparation',
        status: 'not-completed',
        reason: 'Client had already eaten',
      },
    ],
  },
  {
    id: '6',
    clientName: 'Helen Brown',
    date: yesterday,
    startTime: '14:00',
    endTime: '16:00',
    location: {
      address: '900 Birch Court, Springfield, IL',
      latitude: 39.792,
      longitude: -89.641,
    },
    status: 'completed',
    clockIn: {
      timestamp: `${yesterday}T14:01:00Z`,
      latitude: 39.792,
      longitude: -89.641,
    },
    clockOut: {
      timestamp: `${yesterday}T15:58:00Z`,
      latitude: 39.792,
      longitude: -89.641,
    },
    tasks: [
      { id: 't16', title: 'Mobility assistance', status: 'completed' },
      { id: 't17', title: 'Medication reminder', status: 'completed' },
    ],
  },
];

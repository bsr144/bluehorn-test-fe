import { AxiosError } from 'axios';

interface BEErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Array<{ field: string; message: string }>;
  };
}



const fieldLabels: Record<string, string> = {
  employee_id: 'Employee ID',
  caregiver_name: 'Caregiver name',
  patient_name: 'Patient name',
  date: 'Date',
  start_time: 'Start time',
  end_time: 'End time',
  location: 'Location',
  clock_in_time: 'Clock-in time',
  clock_in_lat: 'Clock-in latitude',
  clock_in_lng: 'Clock-in longitude',
  clock_out_time: 'Clock-out time',
  clock_out_lat: 'Clock-out latitude',
  clock_out_lng: 'Clock-out longitude',
  description: 'Task description',
  status: 'Status',
  notes: 'Notes',
};

function humanizeField(field: string): string {
  return fieldLabels[field] || field.replace(/_/g, ' ');
}



const messageRewrites: Array<[RegExp, string | ((m: RegExpMatchArray) => string)]> = [
  [/^must match format CGV-XXXXX.*$/, 'must follow the format CGV-XXXXX (e.g. CGV-00001)'],
  [/^must be after start_time$/, 'must be after the start time'],
  [/^must be after clock_in_time$/, 'must be after the clock-in time'],
  [/^invalid format, expected (.+)$/, (m) => `must use the format ${m[1]}`],
  [/^invalid calendar date$/, 'is not a valid date'],
  [/^is required$/, 'is required'],
  [/^must be in format (.+)$/, (m) => `must use the format ${m[1]}`],
  [/^must be a valid (.+)$/, (m) => `must be a valid ${m[1]}`],
  [/^must be at least (\d+) characters?$/, (m) => `must be at least ${m[1]} characters`],
  [/^must be at most (\d+) characters?$/, (m) => `must not exceed ${m[1]} characters`],
  [/^must not exceed (\d+) characters?$/, (m) => `must not exceed ${m[1]} characters`],
];

function humanizeMessage(msg: string): string {
  for (const [pattern, replacement] of messageRewrites) {
    const match = msg.match(pattern);
    if (match) {
      return typeof replacement === 'function' ? replacement(match) : replacement;
    }
  }
  return msg.replace(/_/g, ' ');
}



const codeMessages: Record<string, string> = {
  EVV_VALIDATION_ERROR: 'Please fix the following:',
  EVV_NOT_FOUND: 'The requested item could not be found.',
  EVV_CONFLICT: 'This action could not be completed.',
  EVV_BAD_REQUEST: 'The request was invalid.',
  EVV_INVALID_REQUEST_BODY: 'The submitted data could not be read.',
  EVV_INTERNAL_ERROR: 'An unexpected error occurred. Please try again.',
};



const conflictRewrites: Array<[RegExp, string]> = [
  [/cannot clock out: (\d+) pending task\(s\) remain/, 'Please complete or skip all pending tasks before ending the visit ($1 remaining).'],
  [/cannot clock in: schedule status is "(.+?)", expected "(.+?)"/, 'This visit cannot be started because it is currently $1.'],
  [/cannot clock out: schedule status is "(.+?)", expected "(.+?)"/, 'This visit cannot be ended because it is currently $1.'],
  [/clock_out_time must be after clock_in_time/, 'Clock-out time must be after the clock-in time.'],
  [/schedule is now marked as missed/, 'This schedule has been automatically marked as missed because its end time has passed.'],
  [/schedule conflicts with an existing schedule/, 'You already have a schedule in the given time range. Please choose a different time.'],
  [/duplicate.*schedule/, 'You already have a schedule in the given time range. Please choose a different time.'],
];

function humanizeConflict(msg: string): string {
  for (const [pattern, replacement] of conflictRewrites) {
    const match = msg.match(pattern);
    if (match) {
      let result = replacement;
      match.forEach((val, i) => {
        if (i > 0) result = result.replace(`$${i}`, val.replace(/_/g, ' '));
      });
      return result;
    }
  }
  return msg.replace(/_/g, ' ');
}



/** Extracts a user-friendly error message from any error, including structured backend errors. */
export function extractErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (err instanceof AxiosError) {
    const body = err.response?.data as BEErrorBody | undefined;

    if (body?.error) {
      const { code, message, fields } = body.error;

      
      if (fields?.length) {
        const lines = fields.map((f) => `${humanizeField(f.field)} ${humanizeMessage(f.message)}`);
        if (lines.length === 1) return lines[0] + '.';
        return lines.map((l) => `\u2022 ${l}`).join('\n');
      }

      
      if (code === 'EVV_CONFLICT') {
        return humanizeConflict(message);
      }

      
      if (code && codeMessages[code] && message) {
        return codeMessages[code];
      }

      return message.replace(/_/g, ' ') || fallback;
    }

    if (err.response?.status === 0 || err.code === 'ERR_NETWORK') {
      return 'Unable to reach the server. Please check your connection and try again.';
    }

    if (err.response?.status === 401) {
      return 'Your session is not authorized. Please check your credentials.';
    }

    if (err.response?.status === 429) {
      return 'Too many requests. Please wait a moment and try again.';
    }

    return fallback;
  }

  if (err instanceof Error) {
    return err.message.replace(/_/g, ' ') || fallback;
  }

  return fallback;
}

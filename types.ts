
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'ADMIN' | 'FACULTY' | 'SECURITY'; 
  regNo?: string;
  avatar?: string;
  department?: string;
}

// ... existing types ...

export interface TimetableSchedule {
  id: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  type: 'LECTURE' | 'LAB' | 'TUTORIAL' | 'WORKSHOP';
  notes?: string;
  subject: {
    name: string;
    code: string;
  };
  classroom: {
    number: string;
    block: {
      name: string;
      code: string;
    };
  };
  teacher: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface StudentProfile {
  id: string;
  userId: string;
  dob?: string;
  phone?: string;
  address?: string;
  bio?: string;
  avatarUrl?: string;
  hostelName?: string;
  roomNumber?: string;
  wardenName?: string;
  department?: string;
  course?: string;
  semester?: number;
  user?: Partial<User>;
}

export interface MessMenuItem {
  category: 'Breakfast' | 'Lunch' | 'Dinner';
  items: string[];
  calories: number;
  protein?: number;
  carbs?: number;
  rating: number; 
  crowdLevel: number; 
  waitTimes?: string;
  timeRange?: string;
}

export interface MailSummary {
  id: string;
  sender: string;
  subject: string;
  summary: string; 
  urgent: boolean;
  type?: 'Academic' | 'Event' | 'Lost & Found' | 'General';
  timestamp: Date;
  timeAgo?: string;
}

export interface Announcement {
  id: string;
  title: string;
  type: 'General' | 'Academic' | 'Emergency';
  content: string;
  timestamp: Date;
}

export interface ScheduleItem {
  id: string;
  subject: string;
  code: string;
  time: string;
  room: string;
}

export interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  subject: string;
}

export interface NearbyHub {
  id: string;
  name: string;
  distance: string;
  tags: string[];
  rating: number;
  image?: string;
}

export interface AttendanceSummary {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  professor: string;
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
  status: 'Safe' | 'Warning' | 'Critical';
}

export interface ClassSessionHistory {
  id: string;
  date: string;
  topic: string;
  startTime: string;
  endTime: string;
  status: 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'LATE';
  remarks?: string;
}

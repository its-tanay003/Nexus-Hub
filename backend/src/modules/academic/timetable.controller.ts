
import { Request, Response } from 'express';
import { prisma } from '../../utils/prisma';
import { DayOfWeek } from '@prisma/client';
import { socketService } from '../../services/socket.service';

// Helper to get DayOfWeek enum from JS Date or string
const getDayEnum = (day: string | number): DayOfWeek => {
  const days: DayOfWeek[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  if (typeof day === 'number') return days[day];
  return (day.toUpperCase() as DayOfWeek);
};

export const getDailyTimetable = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { day } = req.params; // e.g., "MONDAY" or "today"

    let targetDay: DayOfWeek;
    if (!day || day === 'today') {
      targetDay = getDayEnum(new Date().getDay());
    } else {
      targetDay = getDayEnum(day);
    }

    // 1. Get Subjects user is enrolled in
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      select: { subjectId: true }
    });
    
    const subjectIds = enrollments.map(e => e.subjectId);

    // 2. Fetch Schedules
    const schedules = await prisma.schedule.findMany({
      where: {
        subjectId: { in: subjectIds },
        dayOfWeek: targetDay
      },
      include: {
        subject: { select: { name: true, code: true } },
        classroom: { include: { block: true } },
        teacher: { select: { name: true, email: true, avatarUrl: true } }
      },
      orderBy: { startTime: 'asc' }
    });

    res.json({ success: true, day: targetDay, data: schedules });
  } catch (error) {
    console.error("Timetable Error:", error);
    res.status(500).json({ error: "Failed to fetch timetable" });
  }
};

export const getFullTimetable = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      select: { subjectId: true }
    });
    const subjectIds = enrollments.map(e => e.subjectId);

    const schedules = await prisma.schedule.findMany({
      where: { subjectId: { in: subjectIds } },
      include: {
        subject: { select: { name: true, code: true } },
        classroom: { include: { block: true } },
        teacher: { select: { name: true, email: true } }
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });

    const grouped = schedules.reduce((acc, curr) => {
      if (!acc[curr.dayOfWeek]) acc[curr.dayOfWeek] = [];
      acc[curr.dayOfWeek].push(curr);
      return acc;
    }, {} as Record<string, typeof schedules>);

    res.json({ success: true, data: grouped });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch full timetable" });
  }
};

export const downloadCalendar = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    // Fetch all schedules
    const enrollments = await prisma.enrollment.findMany({ where: { userId }, select: { subjectId: true } });
    const subjectIds = enrollments.map(e => e.subjectId);
    
    const schedules = await prisma.schedule.findMany({
      where: { subjectId: { in: subjectIds } },
      include: {
        subject: true,
        classroom: { include: { block: true } },
        teacher: true
      }
    });

    // Helper to calculate date of next occurrence of a day
    const getNextDayDate = (dayName: string) => {
        const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const dayIndex = days.indexOf(dayName);
        const today = new Date();
        const resultDate = new Date();
        resultDate.setDate(today.getDate() + (dayIndex + 7 - today.getDay()) % 7);
        return resultDate;
    };

    const formatICSDate = (date: Date, timeStr: string) => {
        const [hours, mins] = timeStr.split(':').map(Number);
        date.setHours(hours, mins, 0, 0);
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Nexus University//Student App//EN\n";

    schedules.forEach(s => {
        const nextDate = getNextDayDate(s.dayOfWeek);
        const start = formatICSDate(new Date(nextDate), s.startTime);
        const end = formatICSDate(new Date(nextDate), s.endTime);
        
        icsContent += "BEGIN:VEVENT\n";
        icsContent += `SUMMARY:${s.subject.code} - ${s.subject.name} (${s.type})\n`;
        icsContent += `DTSTART:${start}\n`;
        icsContent += `DTEND:${end}\n`;
        icsContent += `LOCATION:${s.classroom.block.code} - ${s.classroom.number}\n`;
        icsContent += `DESCRIPTION:Teacher: ${s.teacher.name} (${s.teacher.email}). ${s.notes || ''}\n`;
        icsContent += "END:VEVENT\n";
    });

    icsContent += "END:VCALENDAR";

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', 'attachment; filename="timetable.ics"');
    res.send(icsContent);

  } catch (error) {
    console.error("Export Error:", error);
    res.status(500).json({ error: "Failed to export calendar" });
  }
};

// Mock Trigger for WebSocket Testing
export const triggerScheduleUpdate = async (req: Request, res: Response) => {
    // In a real app, this would happen on Admin update
    socketService.broadcastScheduleUpdate({
        message: "Room Change: CS-401 moved to Block B, Room 202",
        type: "UPDATE",
        timestamp: new Date()
    });
    res.json({ success: true, message: "Update broadcasted" });
};

import { Request, Response } from 'express';
import { prisma } from '../../utils/prisma';

// Get User's Schedule based on enrollments
export const getTimetable = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Fetch courses user is enrolled in
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: { course: true }
    });

    // Flatten schedule data
    const timetable = enrollments.map(e => ({
      courseCode: e.course.code,
      courseName: e.course.name,
      schedule: e.course.schedule
    }));

    res.json(timetable);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch timetable' });
  }
};

// Get Pending Assignments
export const getAssignments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const now = new Date();

    const assignments = await prisma.assignment.findMany({
      where: {
        course: {
          enrollments: {
            some: { userId }
          }
        },
        dueDate: { gte: now }
      },
      include: { course: true },
      orderBy: { dueDate: 'asc' }
    });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch assignments' });
  }
};

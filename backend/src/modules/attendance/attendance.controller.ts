
import { Request, Response } from 'express';
import { prisma } from '../../utils/prisma';

// GET /api/v1/attendance/summary
export const getAttendanceSummary = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // 1. Get all subjects user is enrolled in
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: { subject: true }
    });

    const summary = await Promise.all(enrollments.map(async (enrollment) => {
      const subjectId = enrollment.subjectId;

      // 2. Count total classes conducted for this subject up to now
      const totalClasses = await prisma.classSession.count({
        where: {
          subjectId,
          endTime: { lte: new Date() } // Only count classes that have finished
        }
      });

      // 3. Count classes where student was present
      const attendedClasses = await prisma.attendanceRecord.count({
        where: {
          studentId: userId,
          classSession: { subjectId },
          status: 'PRESENT'
        }
      });

      // 4. Calculate Percentage
      const percentage = totalClasses > 0 
        ? Math.round((attendedClasses / totalClasses) * 100) 
        : 100; // Default to 100 if no classes yet

      // 5. Determine Status
      let status: 'Safe' | 'Warning' | 'Critical' = 'Safe';
      if (percentage < 75) status = 'Critical';
      else if (percentage < 85) status = 'Warning';

      return {
        subjectId: enrollment.subject.id,
        subjectName: enrollment.subject.name,
        subjectCode: enrollment.subject.code,
        professor: enrollment.subject.professorName,
        totalClasses,
        attendedClasses,
        percentage,
        status
      };
    }));

    res.json({ success: true, data: summary });
  } catch (error) {
    console.error("Attendance Summary Error:", error);
    res.status(500).json({ error: "Failed to fetch attendance summary" });
  }
};

// GET /api/v1/attendance/subject/:subjectId
export const getSubjectDetails = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { subjectId } = req.params;

    // 1. Verify Enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_subjectId: { userId, subjectId }
      },
      include: { subject: true }
    });

    if (!enrollment) {
      return res.status(403).json({ error: "Not enrolled in this subject" });
    }

    // 2. Get All Sessions for this subject with user's attendance record
    const sessions = await prisma.classSession.findMany({
      where: {
        subjectId,
        endTime: { lte: new Date() }
      },
      orderBy: { date: 'desc' },
      include: {
        attendance: {
          where: { studentId: userId },
          select: { status: true, remarks: true }
        }
      }
    });

    // 3. Transform Data for Frontend
    const history = sessions.map(session => ({
      id: session.id,
      date: session.date,
      topic: session.topic || "Regular Lecture",
      startTime: session.startTime,
      endTime: session.endTime,
      status: session.attendance[0]?.status || 'ABSENT', // Default to absent if no record found but class happened
      remarks: session.attendance[0]?.remarks
    }));

    res.json({ 
      success: true, 
      subject: {
        name: enrollment.subject.name,
        code: enrollment.subject.code
      },
      history 
    });

  } catch (error) {
    console.error("Attendance Details Error:", error);
    res.status(500).json({ error: "Failed to fetch class details" });
  }
};

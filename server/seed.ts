import type { Course, Database, UserRecord } from '../shared/types';
import { hashPassword, initials } from './auth';
import { DB_VERSION } from './db';
import { buildUsaiiCourses } from './content/usaiiCourses';

/** Demo sign-in passwords (one per role). Change them from the profile menu after first sign-in. */
export const DEMO_PASSWORDS = {
  learner: 'Learner@2026',
  instructor: 'Instructor@2026',
};

const DAY = 86_400_000;

export function seedDatabase(): Database {
  const now = Date.now();
  const at = (daysAgo: number, hour = 9, minute = 0) => {
    const d = new Date(now - daysAgo * DAY);
    d.setHours(hour, minute, 0, 0);
    // never create timestamps in the future
    return new Date(Math.min(d.getTime(), now - 60_000)).toISOString();
  };

  const mkUser = (id: string, name: string, email: string, role: UserRecord['role'], pw: string, extra: Partial<UserRecord> = {}): UserRecord => ({
    id,
    name,
    email,
    role,
    initials: initials(name),
    active: true,
    createdAt: at(21),
    onboarded: role !== 'learner',
    mustChangePassword: false,
    ...hashPassword(pw),
    ...extra,
  });

  const users: UserRecord[] = [
    mkUser('u_instructor', 'Dr. Patricia Okonkwo', 'instructor@usaii.org', 'instructor', DEMO_PASSWORDS.instructor),
    mkUser('u_alex', 'Alex Rivera', 'alex.rivera@enterprise.com', 'learner', DEMO_PASSWORDS.learner, {
      goal: { statement: 'Use AI to cut my weekly reporting time in half', why: 'I spend every Monday morning on status reports.', minutesPerDay: 30, daysPerWeek: 5 },
      learnMode: 'read',
      onboarded: true,
    }),
    mkUser('u_jordan', 'Jordan Lee', 'jordan.lee@enterprise.com', 'learner', DEMO_PASSWORDS.learner),
    mkUser('u_morgan', 'Morgan Chen', 'morgan.chen@enterprise.com', 'learner', DEMO_PASSWORDS.learner, {
      goal: { statement: 'Plan projects faster with AI without missing risks', why: 'I lead carrier onboarding and planning takes days.', minutesPerDay: 30, daysPerWeek: 4 },
      learnMode: 'do',
      onboarded: true,
    }),
  ];

  // The five USAII courses start as drafts in the instructor's My Courses, with no price set.
  const courses: Course[] = buildUsaiiCourses('u_instructor', at(30));

  return {
    version: DB_VERSION,
    users,
    courses,
    enrollments: [],
    events: [],
    threads: [],
    notifications: [],
    messages: [],
    feedback: [],
    audit: [],
  };
}

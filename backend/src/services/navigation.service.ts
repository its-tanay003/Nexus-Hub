
interface RouteNode {
  keywords: string[];
  path: string;
  description: string;
  responseTemplate: string;
}

// Knowledge graph of the application structure
// This serves two purposes:
// 1. Context injection for the LLM
// 2. Deterministic fallback if the LLM is down
const APP_ROUTES: RouteNode[] = [
  { 
    keywords: ['dashboard', 'home', 'main', 'summary', 'start'], 
    path: '/dashboard', 
    description: 'Main student dashboard with overview',
    responseTemplate: "Taking you to your Dashboard."
  },
  { 
    keywords: ['mess', 'food', 'menu', 'lunch', 'dinner', 'breakfast', 'eat', 'hungry'], 
    path: '/mess', 
    description: 'Mess menu, food ratings, and crowd status',
    responseTemplate: "Here is the live Mess Menu."
  },
  { 
    keywords: ['map', 'explore', 'location', 'find', 'pharmacy', 'shop', 'where'], 
    path: '/explore', 
    description: 'Campus map, navigation, and nearby hubs',
    responseTemplate: "Opening the Campus Explorer."
  },
  { 
    keywords: ['timetable', 'class', 'schedule', 'lecture', 'when'], 
    path: '/timetable', 
    description: 'Academic class schedule and timetable',
    responseTemplate: "Checking your Timetable."
  },
  { 
    keywords: ['profile', 'account', 'me', 'settings', 'photo', 'bio'], 
    path: '/profile', 
    description: 'User settings, profile photo, and personal info',
    responseTemplate: "Opening your Profile settings."
  },
  { 
    keywords: ['attendance', 'present', 'absent', 'percentage'], 
    path: '/attendance', 
    description: 'Attendance records and eligibility status',
    responseTemplate: "Here is your Attendance summary."
  },
  { 
    keywords: ['academics', 'assignments', 'grades', 'homework'], 
    path: '/academics', 
    description: 'Assignments, grades, and study resources',
    responseTemplate: "Opening Academic Cockpit."
  },
  { 
    keywords: ['sos', 'emergency', 'help', 'danger', 'alert', 'police', 'ambulance'], 
    path: 'ACTION:SOS', 
    description: 'Trigger Emergency Protocol',
    responseTemplate: "ACTIVATING EMERGENCY PROTOCOL. STAY CALM."
  }
];

export class NavigationService {
  
  /**
   * Deterministic Intent Mapping (Fallback before LLM)
   * Matches keywords to routes with a simple scoring system.
   */
  public resolveRoute(query: string): { path: string, response: string } | null {
    const lowerQuery = query.toLowerCase();
    
    // Find best match
    const match = APP_ROUTES.find(route => 
      route.keywords.some(k => lowerQuery.includes(k))
    );

    if (match) {
      return { path: match.path, response: match.responseTemplate };
    }
    return null;
  }

  /**
   * Returns available capabilities for System Prompt injection
   */
  public getCapabilities(): string {
    return APP_ROUTES.map(r => `- ${r.description} (Keywords: ${r.keywords.slice(0,3).join(', ')})`).join('\n');
  }
}

export const navigationService = new NavigationService();

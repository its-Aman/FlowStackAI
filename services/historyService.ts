import { FlowHistory } from "../types";

const HISTORY_KEY = 'flowstack_history';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const historyService = {
  // GET /api/history
  getAll: async (): Promise<FlowHistory[]> => {
    await delay(200);
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  // POST /api/history
  addEntry: async (entry: Omit<FlowHistory, 'id'>): Promise<FlowHistory> => {
    await delay(200);
    const history = await historyService.getAll();
    const newEntry: FlowHistory = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9)
    };
    // Add to beginning
    const newHistory = [newEntry, ...history];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    return newEntry;
  },

  // GET /api/stats
  getStats: async () => {
    const history = await historyService.getAll();
    const todayStr = new Date().toDateString();

    const todayEntries = history.filter(h => new Date(h.completedAt).toDateString() === todayStr);
    const focusedToday = todayEntries.reduce((acc, curr) => acc + curr.durationSpent, 0);
    const sessionsCompleted = history.length;

    // Basic Streak Calculation
    // Get unique dates (normalized to midnight)
    const uniqueDays = [...new Set(history.map(h => new Date(h.completedAt).setHours(0,0,0,0)))]
        .sort((a,b) => b - a); // Descending

    let streak = 0;
    const todayTime = new Date().setHours(0,0,0,0);
    const yesterdayTime = todayTime - 86400000;

    if (uniqueDays.length > 0) {
        // If the most recent activity was today or yesterday, the streak is alive
        if (uniqueDays[0] === todayTime || uniqueDays[0] === yesterdayTime) {
            streak = 1;
            let currentCheck = uniqueDays[0] === todayTime ? todayTime : yesterdayTime;
            
            // Look for consecutive previous days
            for (let i = 1; i < uniqueDays.length; i++) {
                const prevDay = currentCheck - 86400000;
                if (uniqueDays[i] === prevDay) {
                    streak++;
                    currentCheck = prevDay;
                } else {
                    break;
                }
            }
        }
    }

    return {
        focusedToday, // seconds
        sessionsCompleted,
        streak
    };
  }
};
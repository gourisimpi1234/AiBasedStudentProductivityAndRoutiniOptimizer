import { useState, useEffect } from "react";
import { Sidebar } from "./dashboard/Sidebar";
import { SchedulerView } from "./dashboard/SchedulerView";
import { CalendarView } from "./dashboard/CalendarView";
import { AnalyticsView } from "./dashboard/AnalyticsView";
import { ChatbotView } from "./dashboard/ChatbotView";
import { EventTrackerView } from "./dashboard/EventTrackerView";
import { ProfileView } from "./dashboard/ProfileView";
import { GoalTimetableView } from "./dashboard/GoalTimetableView";
import { Toaster } from "./ui/sonner";
import { toast } from "sonner@2.0.3";

interface DashboardProps {
  onLogout: () => void;
}

export type ViewType = "scheduler" | "calendar" | "analytics" | "chatbot" | "events" | "profile" | "goaltimetable";

export interface Task {
  id: string;
  title: string;
  description: string;
  time: string;
  priority: "high" | "medium" | "low";
  notified: boolean;
  notifiedBefore: boolean;
  completed: boolean;
}

export interface CollegeEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: "academic" | "cultural" | "sports" | "other";
}

export interface ImportantDate {
  id: string;
  date: string;
  title: string;
  description: string;
}

// Helper function to get user-specific storage key
const getUserKey = (key: string): string => {
  const currentUser = localStorage.getItem("currentUser");
  return currentUser ? `${key}_${currentUser}` : key;
};

export function Dashboard({ onLogout }: DashboardProps) {
  const [currentView, setCurrentView] = useState<ViewType>("scheduler");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Check for birthday on dashboard load
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      const profileKey = getUserKey("userProfile");
      const profile = localStorage.getItem(profileKey);
      
      if (profile) {
        const userProfile = JSON.parse(profile);
        if (userProfile.birthday) {
          const today = new Date();
          const birthday = new Date(userProfile.birthday);
          
          if (
            today.getDate() === birthday.getDate() &&
            today.getMonth() === birthday.getMonth()
          ) {
            // Check if we already showed birthday wish today
            const lastWishKey = getUserKey("lastBirthdayWish");
            const lastWishDate = localStorage.getItem(lastWishKey);
            const todayStr = today.toDateString();
            
            if (lastWishDate !== todayStr) {
              setTimeout(() => {
                toast.success(`🎉 Happy Birthday, ${userProfile.name}! 🎂`, {
                  description: "Wishing you an amazing year ahead filled with success and happiness!",
                  duration: 10000,
                });
              }, 2000);
              localStorage.setItem(lastWishKey, todayStr);
            }
          }
        }
      }
    }
  }, []);

  const addTask = (task: Omit<Task, "id" | "notified" | "notifiedBefore" | "completed">) => {
    const tasksKey = getUserKey("tasks");
    const tasks = JSON.parse(localStorage.getItem(tasksKey) || "[]");
    const newTask: Task = {
      id: Date.now().toString(),
      ...task,
      notified: false,
      notifiedBefore: false,
      completed: false,
    };
    tasks.push(newTask);
    localStorage.setItem(tasksKey, JSON.stringify(tasks));
    setRefreshTrigger((prev) => prev + 1);
    return newTask;
  };

  const addEvent = (event: Omit<CollegeEvent, "id">) => {
    const eventsKey = getUserKey("collegeEvents");
    const events = JSON.parse(localStorage.getItem(eventsKey) || "[]");
    const newEvent: CollegeEvent = {
      id: Date.now().toString(),
      ...event,
    };
    events.push(newEvent);
    localStorage.setItem(eventsKey, JSON.stringify(events));
    setRefreshTrigger((prev) => prev + 1);
    return newEvent;
  };

  const addImportantDate = (importantDate: Omit<ImportantDate, "id">) => {
    const datesKey = getUserKey("importantDates");
    const dates = JSON.parse(localStorage.getItem(datesKey) || "[]");
    const newDate: ImportantDate = {
      id: Date.now().toString(),
      ...importantDate,
    };
    dates.push(newDate);
    localStorage.setItem(datesKey, JSON.stringify(dates));
    setRefreshTrigger((prev) => prev + 1);
    return newDate;
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        onLogout={onLogout}
      />
      
      <main className="flex-1 overflow-auto">
        {currentView === "scheduler" && <SchedulerView key={refreshTrigger} />}
        {currentView === "calendar" && <CalendarView key={refreshTrigger} />}
        {currentView === "analytics" && <AnalyticsView />}
        {currentView === "chatbot" && (
          <ChatbotView 
            onAddTask={addTask}
            onAddEvent={addEvent}
            onAddImportantDate={addImportantDate}
            onNavigate={setCurrentView}
          />
        )}
        {currentView === "events" && <EventTrackerView key={refreshTrigger} />}
        {currentView === "profile" && <ProfileView />}
        {currentView === "goaltimetable" && <GoalTimetableView />}
      </main>

      <Toaster />
    </div>
  );
}

// Export the helper function for use in other components
export { getUserKey };
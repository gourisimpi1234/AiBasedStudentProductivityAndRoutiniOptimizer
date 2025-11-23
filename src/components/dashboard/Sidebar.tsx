import { Brain, Calendar, BarChart3, MessageSquare, CalendarDays, LogOut, User, Target, Star } from "lucide-react";
import { ViewType } from "../Dashboard";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { getUserKey } from "../Dashboard";

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onLogout: () => void;
}

export function Sidebar({ currentView, onViewChange, onLogout }: SidebarProps) {
  const [totalStars, setTotalStars] = useState(0);

  useEffect(() => {
    // Load total stars from localStorage
    const loadStars = () => {
      const savedProgress = localStorage.getItem(getUserKey("goalProgress"));
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        setTotalStars(progress.starsEarned || 0);
      }
    };

    loadStars();

    // Set up interval to check for star updates
    const interval = setInterval(loadStars, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { id: "scheduler" as ViewType, label: "Scheduler", icon: Calendar },
    { id: "goaltimetable" as ViewType, label: "Goal Timetable", icon: Target },
    { id: "calendar" as ViewType, label: "Calendar", icon: CalendarDays },
    { id: "events" as ViewType, label: "Events", icon: CalendarDays },
    { id: "analytics" as ViewType, label: "Analytics", icon: BarChart3 },
    { id: "chatbot" as ViewType, label: "AI Assistant", icon: MessageSquare },
    { id: "profile" as ViewType, label: "Profile", icon: User },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Brain className="size-8 text-indigo-600" strokeWidth={1.5} />
          <div>
            <h2 className="text-slate-900">AI Student</h2>
            <p className="text-slate-500 text-sm">Productivity App</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="size-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Star Counter Display */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-xl border-2 border-yellow-300 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-700 text-sm">Total Stars</span>
            <Star className="size-5 text-yellow-500 fill-yellow-500 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <Star className="size-6 text-yellow-600 fill-yellow-600 star-blink" />
            <span className="text-2xl text-slate-900">{totalStars}</span>
          </div>
          <p className="text-xs text-slate-600 mt-2">Keep earning stars! ⭐</p>
        </div>
      </div>

      <div className="p-4 border-t border-slate-200">
        <Button
          onClick={onLogout}
          variant="outline"
          className="w-full justify-start"
        >
          <LogOut className="mr-2 size-5" />
          Logout
        </Button>
      </div>

      <style>{`
        @keyframes star-blink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.9); }
        }

        .star-blink {
          animation: star-blink 2s ease-in-out infinite;
        }
      `}</style>
    </aside>
  );
}
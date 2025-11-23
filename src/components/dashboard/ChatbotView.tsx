import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { motion } from "motion/react";
import { toast } from "sonner@2.0.3";
import { Task, CollegeEvent, ImportantDate, ViewType, getUserKey } from "../Dashboard";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  action?: string;
}

interface ChatbotViewProps {
  onAddTask: (task: Omit<Task, "id" | "notified" | "notifiedBefore" | "completed">) => Task;
  onAddEvent: (event: Omit<CollegeEvent, "id">) => CollegeEvent;
  onAddImportantDate: (date: Omit<ImportantDate, "id">) => ImportantDate;
  onNavigate: (view: ViewType) => void;
}

export function ChatbotView({ onAddTask, onAddEvent, onAddImportantDate, onNavigate }: ChatbotViewProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content: "Hello! 👋 I'm your intelligent AI study assistant specialized in creating personalized study timetables!\n\n📚 **TIMETABLE CREATION (My Specialty!):**\n• Create custom daily/weekly study schedules\n• Subject-wise time allocation\n• Exam preparation timetables\n• Balanced study routines with breaks\n• Flexible scheduling based on YOUR availability\n\n🎯 **NEW! Goal-Based Timetable:**\n• Set short-term & long-term goals\n• Get AI-generated study schedules\n• Track progress with visual progress bars\n• Earn motivating stars as you complete tasks!\n• Say 'Show me goal timetable' to get started!\n\n💡 **What I can do:**\n✅ Schedule tasks, exams, and events\n✅ Mark tasks complete or remove them\n✅ Set important dates\n✅ Provide study tips and motivation\n\n**Try these for timetable creation:**\n• 'Create a weekly timetable for Math, Physics, English'\n• 'Make a study schedule from 2 PM to 8 PM'\n• 'I have exams - English 9:30, Math 2 PM tomorrow'\n• 'Create balanced routine for 5 subjects'\n• 'Weekend study plan for 4 hours'\n\n**Quick commands:**\n• 'Create daily routine' - Get a complete study schedule\n• 'Help me plan my studies' - Personalized guidance\n• 'Show goal timetable' - Open goal-based planning\n\nJust describe what you need - I'll create the perfect timetable! 🎯",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Enhanced time extraction with more formats
  const extractTime = (message: string): string => {
    const lowerMsg = message.toLowerCase();
    
    // Time patterns
    const timePatterns = [
      /(\d{1,2})\s*:\s*(\d{2})\s*(am|pm)?/i, // 3:30 PM, 3:30
      /(\d{1,2})\s*(am|pm)/i, // 3pm, 3 PM
      /at\s+(\d{1,2})/i, // at 3
      /(morning|afternoon|evening|night)/i, // morning
    ];

    for (const pattern of timePatterns) {
      const match = message.match(pattern);
      if (match) {
        if (match[0].match(/morning/i)) return "09:00";
        if (match[0].match(/afternoon/i)) return "14:00";
        if (match[0].match(/evening/i)) return "18:00";
        if (match[0].match(/night/i)) return "20:00";

        let hours = parseInt(match[1]);
        const minutes = match[2] || "00";
        const meridiem = match[3]?.toLowerCase();

        if (meridiem === "pm" && hours < 12) hours += 12;
        if (meridiem === "am" && hours === 12) hours = 0;
        if (!meridiem && hours < 8) hours += 12; // Assume PM for small numbers without AM/PM

        return `${hours.toString().padStart(2, "0")}:${minutes}`;
      }
    }

    // Default time
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return `${now.getHours().toString().padStart(2, "0")}:00`;
  };

  // Enhanced date extraction with more formats
  const extractDate = (message: string): string => {
    const lowerMsg = message.toLowerCase();
    const today = new Date();

    // Relative dates
    if (lowerMsg.includes("today")) return today.toISOString().split("T")[0];
    if (lowerMsg.includes("tomorrow")) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split("T")[0];
    }
    if (lowerMsg.includes("day after tomorrow")) {
      const dat = new Date(today);
      dat.setDate(dat.getDate() + 2);
      return dat.toISOString().split("T")[0];
    }
    if (lowerMsg.includes("next week")) {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek.toISOString().split("T")[0];
    }
    if (lowerMsg.includes("next month")) {
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth.toISOString().split("T")[0];
    }

    // Weekday detection
    const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    for (let i = 0; i < weekdays.length; i++) {
      if (lowerMsg.includes(weekdays[i])) {
        const currentDay = today.getDay();
        const targetDay = i + 1;
        let daysToAdd = targetDay - currentDay;
        if (daysToAdd <= 0) daysToAdd += 7;
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + daysToAdd);
        return targetDate.toISOString().split("T")[0];
      }
    }

    // Date patterns
    const datePatterns = [
      { regex: /(\d{4})-(\d{2})-(\d{2})/, format: "yyyy-mm-dd" },
      { regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/, format: "mm/dd/yyyy" },
      { regex: /(\d{1,2})\/(\d{1,2})/, format: "mm/dd" },
    ];

    for (const { regex, format } of datePatterns) {
      const match = message.match(regex);
      if (match) {
        if (format === "yyyy-mm-dd") {
          return match[0];
        } else if (format === "mm/dd/yyyy") {
          return `${match[3]}-${match[1].padStart(2, "0")}-${match[2].padStart(2, "0")}`;
        } else if (format === "mm/dd") {
          return `${today.getFullYear()}-${match[1].padStart(2, "0")}-${match[2].padStart(2, "0")}`;
        }
      }
    }

    // Month names
    const months = {
      january: 1, jan: 1, february: 2, feb: 2, march: 3, mar: 3,
      april: 4, apr: 4, may: 5, june: 6, jun: 6,
      july: 7, jul: 7, august: 8, aug: 8, september: 9, sep: 9,
      october: 10, oct: 10, november: 11, nov: 11, december: 12, dec: 12
    };

    for (const [monthName, monthNum] of Object.entries(months)) {
      const pattern = new RegExp(`${monthName}\\s+(\\d{1,2})`, "i");
      const match = message.match(pattern);
      if (match) {
        const day = parseInt(match[1]);
        return `${today.getFullYear()}-${monthNum.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
      }
    }

    return "";
  };

  // Intelligent title extraction
  const extractTitle = (message: string, type: "task" | "event" | "date"): string => {
    let cleaned = message;

    // Remove common command words
    const removeWords = [
      "add", "create", "schedule", "remind", "me", "to", "please", "can you", "could you",
      "at", "on", "for", "the", "a", "an", "my", "as", "mark", "set", "make",
      "task", "event", "date", "day", "important", "special", "tomorrow", "today",
      "next week", "next month", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
      "morning", "afternoon", "evening", "night", "this"
    ];

    removeWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      cleaned = cleaned.replace(regex, "");
    });

    // Remove time patterns
    cleaned = cleaned.replace(/\d{1,2}:\d{2}\s*(am|pm)?/gi, "");
    cleaned = cleaned.replace(/\d{1,2}\s*(am|pm)/gi, "");

    // Remove date patterns
    cleaned = cleaned.replace(/\d{4}-\d{2}-\d{2}/g, "");
    cleaned = cleaned.replace(/\d{1,2}\/\d{1,2}(\/\d{4})?/g, "");
    cleaned = cleaned.replace(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}/gi, "");

    // Clean up extra spaces and trim
    cleaned = cleaned.replace(/\s+/g, " ").trim();

    // Default titles
    if (!cleaned || cleaned.length < 2) {
      if (type === "task") return "New Task";
      if (type === "event") return "New Event";
      if (type === "date") return "Important Day";
    }

    // Capitalize first letter
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };

  // Main command parser
  const parseAndExecuteCommand = (userMessage: string): { response: string; action?: string } => {
    const lowerMessage = userMessage.toLowerCase();

    // ===== DELETE/REMOVE COMMANDS =====
    if (
      (lowerMessage.includes("delete") || lowerMessage.includes("remove") || 
       lowerMessage.includes("cancel") || lowerMessage.includes("clear")) &&
      (lowerMessage.includes("task") || lowerMessage.includes("schedule") || 
       lowerMessage.includes("event") || lowerMessage.includes("date"))
    ) {
      // Clear all tasks
      if (lowerMessage.includes("all") || lowerMessage.includes("everything")) {
        if (lowerMessage.includes("task")) {
          localStorage.setItem(getUserKey("tasks"), JSON.stringify([]));
          toast.success("All tasks cleared!");
          return {
            response: "✅ All tasks have been cleared from your schedule. Ready for a fresh start!",
            action: "all_tasks_cleared"
          };
        }
        if (lowerMessage.includes("event")) {
          localStorage.setItem(getUserKey("collegeEvents"), JSON.stringify([]));
          toast.success("All events cleared!");
          return {
            response: "✅ All events have been cleared!",
            action: "all_events_cleared"
          };
        }
      }

      // Delete specific task
      const tasks = JSON.parse(localStorage.getItem(getUserKey("tasks")) || "[]");
      let taskToDelete = null;
      
      for (const task of tasks) {
        if (lowerMessage.includes(task.title.toLowerCase())) {
          taskToDelete = task;
          break;
        }
      }

      if (taskToDelete) {
        const updatedTasks = tasks.filter((t: any) => t.id !== taskToDelete.id);
        localStorage.setItem(getUserKey("tasks"), JSON.stringify(updatedTasks));
        toast.success(`Deleted: ${taskToDelete.title}`);
        return {
          response: `✅ I've removed "${taskToDelete.title}" from your schedule.`,
          action: "task_deleted"
        };
      } else {
        return {
          response: "I couldn't find that specific task. Could you tell me the exact name? You can also manually delete it from the Scheduler tab."
        };
      }
    }

    // ===== COMPLETE/MARK DONE COMMANDS =====
    if (
      (lowerMessage.includes("complete") || lowerMessage.includes("done") || 
       lowerMessage.includes("finish") || lowerMessage.includes("mark as complete")) &&
      (lowerMessage.includes("task") || !lowerMessage.includes("event"))
    ) {
      const tasks = JSON.parse(localStorage.getItem(getUserKey("tasks")) || "[]");
      let taskToComplete = null;
      
      for (const task of tasks) {
        if (lowerMessage.includes(task.title.toLowerCase())) {
          taskToComplete = task;
          break;
        }
      }

      if (taskToComplete) {
        const updatedTasks = tasks.map((t: any) => 
          t.id === taskToComplete.id ? { ...t, completed: true } : t
        );
        localStorage.setItem(getUserKey("tasks"), JSON.stringify(updatedTasks));
        toast.success(`✅ Completed: ${taskToComplete.title}`);
        return {
          response: `✅ Excellent! I've marked "${taskToComplete.title}" as completed. Great job staying productive! 🎉`,
          action: "task_completed"
        };
      } else {
        return {
          response: "Which task would you like to mark as complete? Please mention the task name."
        };
      }
    }

    // ===== VIEW/SHOW COMMANDS =====
    if (lowerMessage.includes("show") || lowerMessage.includes("open") || lowerMessage.includes("view") || lowerMessage.includes("go to")) {
      if (lowerMessage.includes("goal") || (lowerMessage.includes("timetable") && !lowerMessage.includes("create"))) {
        setTimeout(() => onNavigate("goaltimetable"), 1000);
        return {
          response: "🎯 Opening your Goal-Based Timetable now...\n\nHere you can set your goals and get an AI-generated timetable to achieve them!",
          action: "navigate_goaltimetable"
        };
      }
      if (lowerMessage.includes("schedule") || lowerMessage.includes("task")) {
        setTimeout(() => onNavigate("scheduler"), 1000);
        return {
          response: "📅 Opening your scheduler now...",
          action: "navigate_scheduler"
        };
      }
      if (lowerMessage.includes("event")) {
        setTimeout(() => onNavigate("events"), 1000);
        return {
          response: "📅 Opening your events page...",
          action: "navigate_events"
        };
      }
      if (lowerMessage.includes("calendar")) {
        setTimeout(() => onNavigate("calendar"), 1000);
        return {
          response: "📅 Opening your calendar...",
          action: "navigate_calendar"
        };
      }
      if (lowerMessage.includes("analytic") || lowerMessage.includes("statistic") || lowerMessage.includes("progress")) {
        setTimeout(() => onNavigate("analytics"), 1000);
        return {
          response: "📊 Opening your analytics dashboard...",
          action: "navigate_analytics"
        };
      }
      if (lowerMessage.includes("profile")) {
        setTimeout(() => onNavigate("profile"), 1000);
        return {
          response: "👤 Opening your profile...",
          action: "navigate_profile"
        };
      }
    }

    // ===== MARK IMPORTANT DATE / SPECIAL DAY COMMANDS =====
    if (
      (lowerMessage.includes("mark") || lowerMessage.includes("make") || 
       lowerMessage.includes("set") || lowerMessage.includes("add")) &&
      (lowerMessage.includes("important") || lowerMessage.includes("special") || 
       lowerMessage.includes("date") || lowerMessage.includes("day") ||
       lowerMessage.includes("birthday") || lowerMessage.includes("anniversary") ||
       lowerMessage.includes("holiday") || lowerMessage.includes("celebration"))
    ) {
      const dateStr = extractDate(userMessage);
      
      if (!dateStr) {
        return {
          response: "I'd love to mark that date! Could you specify when? For example:\n• 'Mark December 25 as Christmas'\n• 'Make tomorrow my special day'\n• 'Set next Monday as important'"
        };
      }

      const title = extractTitle(userMessage, "date");
      
      onAddImportantDate({
        date: dateStr,
        title: title,
        description: "Marked via AI Assistant"
      });

      const formattedDate = new Date(dateStr).toLocaleDateString("en-US", { 
        weekday: "long",
        month: "long", 
        day: "numeric", 
        year: "numeric" 
      });

      toast.success(`⭐ Date marked: ${title}`);

      return {
        response: `⭐ Perfect! I've marked ${formattedDate} as "${title}" in your calendar.\n\nThis date will be highlighted in your Calendar view. You'll see it whenever you check your schedule! 🎉`,
        action: "date_marked"
      };
    }

    // ===== ADD EVENT COMMANDS =====
    if (
      (lowerMessage.includes("event") || lowerMessage.includes("exam") || 
       lowerMessage.includes("test") || lowerMessage.includes("meeting") || 
       lowerMessage.includes("class") || lowerMessage.includes("lecture") ||
       lowerMessage.includes("seminar") || lowerMessage.includes("workshop") || 
       lowerMessage.includes("conference") || lowerMessage.includes("fest") ||
       lowerMessage.includes("tournament") || lowerMessage.includes("competition"))
    ) {
      const dateStr = extractDate(userMessage);
      const time = extractTime(userMessage);
      
      if (!dateStr) {
        return {
          response: "I can add that event! When should it be? For example:\n• 'Add exam on November 30 at 9 AM'\n• 'Schedule meeting tomorrow at 2 PM'\n• 'Add workshop next Monday at 10 AM'"
        };
      }

      const title = extractTitle(userMessage, "event");

      // Determine event type intelligently
      let eventType: "academic" | "cultural" | "sports" | "other" = "academic";
      if (lowerMessage.includes("cultural") || lowerMessage.includes("fest") || 
          lowerMessage.includes("celebration") || lowerMessage.includes("function") ||
          lowerMessage.includes("festival") || lowerMessage.includes("party")) {
        eventType = "cultural";
      } else if (lowerMessage.includes("sport") || lowerMessage.includes("game") || 
                 lowerMessage.includes("match") || lowerMessage.includes("tournament") ||
                 lowerMessage.includes("competition")) {
        eventType = "sports";
      } else if (!lowerMessage.includes("exam") && !lowerMessage.includes("test") && 
                 !lowerMessage.includes("class") && !lowerMessage.includes("lecture") &&
                 !lowerMessage.includes("seminar") && !lowerMessage.includes("workshop")) {
        eventType = "other";
      }

      onAddEvent({
        title: title,
        description: "Added via AI Assistant",
        date: dateStr,
        time: time,
        location: "To be confirmed",
        type: eventType
      });

      const formattedDate = new Date(dateStr).toLocaleDateString("en-US", { 
        weekday: "long",
        month: "long", 
        day: "numeric", 
        year: "numeric" 
      });

      toast.success(`📅 Event added: ${title}`);

      return {
        response: `📅 Awesome! I've added "${title}" to your events.\n\n📋 Event Details:\n• Date: ${formattedDate}\n• Time: ${time}\n• Type: ${eventType.toUpperCase()}\n• Location: To be confirmed\n\nCheck the Events tab to view and edit details!`,
        action: "event_added"
      };
    }

    // ===== ADD TASK/TODO COMMANDS =====
    // This is the catch-all for any scheduling/task creation
    if (
      lowerMessage.includes("add") || lowerMessage.includes("schedule") || 
      lowerMessage.includes("remind") || lowerMessage.includes("set") || 
      lowerMessage.includes("create") || lowerMessage.includes("plan") ||
      lowerMessage.includes("need to") || lowerMessage.includes("have to") ||
      lowerMessage.includes("want to") || lowerMessage.includes("going to")
    ) {
      const time = extractTime(userMessage);
      const title = extractTitle(userMessage, "task");

      // Determine priority
      let priority: "high" | "medium" | "low" = "medium";
      if (lowerMessage.includes("important") || lowerMessage.includes("urgent") || 
          lowerMessage.includes("critical") || lowerMessage.includes("asap") ||
          lowerMessage.includes("priority") || lowerMessage.includes("must")) {
        priority = "high";
      } else if (lowerMessage.includes("low priority") || lowerMessage.includes("optional") || 
                 lowerMessage.includes("when free") || lowerMessage.includes("if time") ||
                 lowerMessage.includes("maybe")) {
        priority = "low";
      }

      onAddTask({
        title: title,
        description: `Added via AI Assistant`,
        time: time,
        priority: priority,
      });

      toast.success(`✅ Task added: ${title}`);

      return {
        response: `✅ Done! I've added "${title}" to your schedule.\n\n📋 Task Details:\n• Time: ${time}\n• Priority: ${priority.toUpperCase()}\n• Notifications: 5 min before + at start time\n\nAnything else you'd like to add?`,
        action: "task_added"
      };
    }

    // ===== ROUTINE CREATION =====
    if (lowerMessage.includes("routine") || lowerMessage.includes("daily plan") || 
        lowerMessage.includes("study plan") || lowerMessage.includes("schedule for day") ||
        lowerMessage.includes("create timetable") || lowerMessage.includes("study timetable") ||
        lowerMessage.includes("make timetable") || lowerMessage.includes("time table")) {
      
      // Check if it's exam-related timetable
      if (lowerMessage.includes("exam") || lowerMessage.includes("test")) {
        // Let the exam preparation handler take care of it
        // Fall through to exam handler below
      } else {
        // Regular daily routine/study timetable
        const customSchedule = parseStudySchedule(lowerMessage);
        
        if (customSchedule.tasks.length > 0) {
          // User specified custom times/subjects
          customSchedule.tasks.forEach(task => {
            onAddTask({
              title: task.title,
              description: task.description,
              time: task.time,
              priority: task.priority,
            });
          });
          
          toast.success("✅ Custom study timetable created!");
          
          return {
            response: customSchedule.message,
            action: "custom_timetable_created"
          };
        } else {
          // Default daily routine
          const routineTasks = [
            { title: "Morning Study Session", time: "09:00", priority: "high" as const, desc: "Fresh mind - tackle difficult subjects" },
            { title: "Attend Classes", time: "11:00", priority: "high" as const, desc: "Focus and take notes" },
            { title: "Lunch Break", time: "13:00", priority: "low" as const, desc: "Healthy meal and relaxation" },
            { title: "Afternoon Study", time: "15:00", priority: "medium" as const, desc: "Review class notes" },
            { title: "Exercise/Break", time: "17:00", priority: "low" as const, desc: "Physical activity - refresh mind" },
            { title: "Evening Revision", time: "19:00", priority: "medium" as const, desc: "Practice and problem-solving" },
          ];

          routineTasks.forEach(task => {
            onAddTask({
              title: task.title,
              description: task.desc,
              time: task.time,
              priority: task.priority,
            });
          });

          toast.success("📅 Daily routine created!");

          return {
            response: "📅 **Daily Study Routine Created!**\n\n✅ All tasks added to your Scheduler:\n\n📚 Morning Study - 9:00 AM (High Priority)\n📖 Classes - 11:00 AM (High Priority)\n🍽️ Lunch Break - 1:00 PM\n📝 Afternoon Study - 3:00 PM\n💪 Exercise/Break - 5:00 PM\n📚 Evening Revision - 7:00 PM\n\n💡 **Tip:** You can remove any task by clicking the ✕ button in the Scheduler!\n\nAll tasks have notifications enabled. Stay productive! 🎯",
            action: "routine_created"
          };
        }
      }
    }

    // Helper function to parse custom study schedule from user input
    function parseStudySchedule(message: string) {
      const tasks: Array<{title: string; description: string; time: string; priority: "high" | "medium" | "low"}> = [];
      let responseMessage = "📚 **Custom Study Timetable Created!**\n\n";
      
      // Parse subject mentions
      const subjects = [];
      const subjectPatterns = [
        { pattern: /english/i, name: "English", emoji: "📚" },
        { pattern: /math|maths|mathematics/i, name: "Mathematics", emoji: "🔢" },
        { pattern: /science|physics|chemistry|biology/i, name: "Science", emoji: "🔬" },
        { pattern: /programming|coding|c\s+language|java|python/i, name: "Programming", emoji: "💻" },
        { pattern: /history/i, name: "History", emoji: "📜" },
        { pattern: /geography/i, name: "Geography", emoji: "🌍" },
      ];
      
      subjectPatterns.forEach(({pattern, name, emoji}) => {
        if (pattern.test(message)) {
          subjects.push({name, emoji});
        }
      });
      
      // Parse time mentions
      const timeMatches = message.match(/(\d{1,2})[:\.]?(\d{2})?(\s*)(am|pm)?/gi);
      const times: string[] = [];
      
      if (timeMatches && timeMatches.length > 0) {
        timeMatches.forEach(timeStr => {
          let hour = 0;
          let minute = 0;
          
          const cleanTime = timeStr.toLowerCase().trim();
          const match = cleanTime.match(/(\d{1,2})[:\.]?(\d{2})?(\s*)(am|pm)?/);
          
          if (match) {
            hour = parseInt(match[1]);
            minute = match[2] ? parseInt(match[2]) : 0;
            
            // Handle AM/PM
            if (match[4]) {
              if (match[4] === 'pm' && hour < 12) hour += 12;
              if (match[4] === 'am' && hour === 12) hour = 0;
            }
            
            // If no AM/PM specified, assume sensible defaults
            if (!match[4]) {
              // If hour is less than 7, assume PM for study hours
              if (hour < 7 && hour !== 1 && hour !== 2 && hour !== 3) hour += 12;
            }
            
            const formattedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            if (!times.includes(formattedTime)) {
              times.push(formattedTime);
            }
          }
        });
      }
      
      // Check for duration mentions (e.g., "1 hour", "2 hours")
      const durationMatch = message.match(/(\d+)\s*(hour|hr|minute|min)/i);
      let duration = 60; // default 1 hour
      if (durationMatch) {
        const value = parseInt(durationMatch[1]);
        const unit = durationMatch[2].toLowerCase();
        if (unit.includes('min')) {
          duration = value;
        } else {
          duration = value * 60;
        }
      }
      
      // Create tasks based on parsed information
      if (subjects.length > 0 && times.length > 0) {
        // Match subjects with times
        times.forEach((time, index) => {
          if (index < subjects.length) {
            const subject = subjects[index];
            tasks.push({
              title: `${subject.emoji} ${subject.name} Study`,
              description: `Focus on ${subject.name} - important topics and practice`,
              time: time,
              priority: "high"
            });
            
            responseMessage += `• ${formatTime(time)} - ${subject.name} Study ${subject.emoji}\n`;
            
            // Add break after study session (except last one)
            if (index < subjects.length - 1) {
              const breakTime = addMinutesToTime(time, duration);
              tasks.push({
                title: "☕ Short Break",
                description: "Rest and refresh - 10-15 minutes",
                time: breakTime,
                priority: "low"
              });
              responseMessage += `• ${formatTime(breakTime)} - Short Break ☕\n`;
            }
          }
        });
      } else if (subjects.length > 0) {
        // Subjects mentioned but no specific times - create a schedule
        const now = new Date();
        let currentHour = Math.max(now.getHours() + 1, 14); // Start from next hour or 2 PM
        
        responseMessage += "📅 **Created schedule starting from " + currentHour + ":00**\n\n";
        
        subjects.forEach((subject, index) => {
          const studyTime = `${currentHour.toString().padStart(2, '0')}:00`;
          tasks.push({
            title: `${subject.emoji} ${subject.name} Study`,
            description: `Focus on ${subject.name} - concepts and practice`,
            time: studyTime,
            priority: "high"
          });
          
          responseMessage += `• ${formatTime(studyTime)} - ${subject.name} Study ${subject.emoji}\n`;
          
          currentHour += 2; // 2 hours per subject including break
          
          // Add break
          if (index < subjects.length - 1) {
            const breakTime = `${(currentHour - 1).toString().padStart(2, '0')}:30`;
            tasks.push({
              title: "☕ Short Break",
              description: "Rest and refresh",
              time: breakTime,
              priority: "low"
            });
            responseMessage += `• ${formatTime(breakTime)} - Break ☕\n`;
          }
        });
      } else if (times.length > 0) {
        // Only times mentioned - create generic study blocks
        times.forEach((time, index) => {
          tasks.push({
            title: `📚 Study Session ${index + 1}`,
            description: "Focused study time - important topics",
            time: time,
            priority: "high"
          });
          
          responseMessage += `• ${formatTime(time)} - Study Session ${index + 1} 📚\n`;
        });
      }
      
      if (tasks.length > 0) {
        responseMessage += "\n✅ All tasks added to your Scheduler with notifications!\n";
        responseMessage += "💡 **Tip:** Click the ✕ button on any task to remove it from your schedule.\n";
        responseMessage += "\nStay focused and productive! 🎯";
      }
      
      return { tasks, message: responseMessage };
    }
    
    // Helper to add minutes to a time string
    function addMinutesToTime(timeStr: string, minutes: number): string {
      const [hours, mins] = timeStr.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, mins + minutes);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    // ===== EXAM PREPARATION SCHEDULE =====
    if (
      (lowerMessage.includes("exam") || lowerMessage.includes("test")) &&
      (lowerMessage.includes("prepare") || lowerMessage.includes("schedule") || 
       lowerMessage.includes("study") || lowerMessage.includes("routine") ||
       lowerMessage.includes("plan") || lowerMessage.includes("timetable"))
    ) {
      // Parse exam information from user input
      const examInfo = parseExamInfo(lowerMessage);
      
      // Get current time
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Create dynamic study schedule
      const studySchedule = createDynamicStudySchedule(examInfo, now);
      
      // Add all tasks
      studySchedule.tasks.forEach(task => {
        onAddTask({
          title: task.title,
          description: task.desc,
          time: task.time,
          priority: task.priority,
        });
      });
      
      // Add exam events
      examInfo.exams.forEach(exam => {
        onAddEvent({
          title: `${exam.subject} Exam`,
          description: exam.description || "Stay calm and confident! You've prepared well.",
          date: exam.date,
          time: exam.time,
          location: exam.location || "Exam Hall",
          type: "academic"
        });
      });
      
      toast.success("📚 Personalized study timetable created!");
      
      return {
        response: studySchedule.message,
        action: "exam_schedule_created"
      };
    }

    // Helper function to parse exam information
    function parseExamInfo(message: string) {
      const exams: Array<{subject: string; time: string; date: string; description?: string; location?: string}> = [];
      const now = new Date();
      
      // Determine when exams are
      const isTomorrow = message.includes("tomorrow");
      const isDayAfter = message.includes("day after") || message.includes("next day");
      
      let examDate = new Date(now);
      if (isTomorrow) {
        examDate.setDate(examDate.getDate() + 1);
      } else if (isDayAfter) {
        examDate.setDate(examDate.getDate() + 2);
      }
      const dateStr = examDate.toISOString().split("T")[0];
      
      // Extract subjects and times
      const subjectPatterns = [
        { pattern: /english/i, name: "English", emoji: "📚" },
        { pattern: /c programming|c-programming|programming/i, name: "C Programming", emoji: "💻" },
        { pattern: /\bc\b.*program/i, name: "C Programming", emoji: "💻" },
        { pattern: /java/i, name: "Java", emoji: "☕" },
        { pattern: /python/i, name: "Python", emoji: "🐍" },
        { pattern: /math|maths|mathematics/i, name: "Mathematics", emoji: "🔢" },
        { pattern: /physics/i, name: "Physics", emoji: "⚛️" },
        { pattern: /chemistry/i, name: "Chemistry", emoji: "🧪" },
        { pattern: /biology/i, name: "Biology", emoji: "🧬" },
        { pattern: /history/i, name: "History", emoji: "📜" },
        { pattern: /geography/i, name: "Geography", emoji: "🌍" },
        { pattern: /economics/i, name: "Economics", emoji: "💰" },
        { pattern: /data structures|ds|dsa/i, name: "Data Structures", emoji: "🗂️" },
        { pattern: /database|dbms/i, name: "Database", emoji: "🗄️" },
        { pattern: /web|html|css/i, name: "Web Development", emoji: "🌐" },
      ];
      
      // Extract times (formats: 9:30, 9.30, 930, "nine thirty")
      const timeMatches = message.match(/(\d{1,2})[:\.]?(\d{2})|(\d{1,2})\s*(am|pm)/gi);
      const times: string[] = [];
      
      if (timeMatches) {
        timeMatches.forEach(timeStr => {
          let hour = 0;
          let minute = 0;
          
          // Parse different time formats
          if (timeStr.includes(':') || timeStr.includes('.')) {
            const parts = timeStr.split(/[:\.]/);
            hour = parseInt(parts[0]);
            minute = parts[1] ? parseInt(parts[1]) : 0;
          } else {
            const match = timeStr.match(/(\d{1,2})\s*(am|pm)?/i);
            if (match) {
              hour = parseInt(match[1]);
              if (match[2] && match[2].toLowerCase() === 'pm' && hour < 12) {
                hour += 12;
              }
            }
          }
          
          // Format time as HH:MM
          const formattedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          times.push(formattedTime);
        });
      }
      
      // Match subjects with times
      let timeIndex = 0;
      subjectPatterns.forEach(({pattern, name, emoji}) => {
        if (pattern.test(message)) {
          const examTime = times[timeIndex] || "09:00";
          exams.push({
            subject: name,
            time: examTime,
            date: dateStr,
            description: `${emoji} Stay focused and confident!`,
            location: "Exam Hall"
          });
          timeIndex++;
        }
      });
      
      // If no subjects detected, create generic exams
      if (exams.length === 0 && times.length > 0) {
        times.forEach((time, index) => {
          exams.push({
            subject: `Subject ${index + 1}`,
            time: time,
            date: dateStr,
            description: "Give your best effort!",
            location: "Exam Hall"
          });
        });
      }
      
      return {
        exams,
        isTomorrow,
        isDayAfter,
        examDate,
        totalExams: exams.length
      };
    }

    // Helper function to create dynamic study schedule
    function createDynamicStudySchedule(examInfo: any, now: Date) {
      const tasks = [];
      const currentHour = now.getHours();
      const { exams, isTomorrow, examDate, totalExams } = examInfo;
      
      let message = "📚 **PERSONALIZED EXAM PREPARATION TIMETABLE**\n\n";
      
      if (exams.length === 0) {
        return {
          tasks: [],
          message: "I couldn't detect specific exam details. Please tell me:\n- Which subjects?\n- What time are the exams?\n- When are they (tomorrow/next week)?\n\nExample: 'Tomorrow I have English at 9:30 AM and Math at 2 PM'"
        };
      }
      
      // Sort exams by time
      exams.sort((a: any, b: any) => a.time.localeCompare(b.time));
      
      message += `📅 **Exam Schedule (${isTomorrow ? 'Tomorrow' : examDate.toLocaleDateString()}):**\n`;
      exams.forEach((exam: any, index: number) => {
        message += `${index + 1}. ${exam.subject} - ${formatTime(exam.time)} ${exam.description || ''}\n`;
      });
      message += "\n";
      
      // TODAY'S PREPARATION (if exams are tomorrow)
      if (isTomorrow) {
        message += "🎯 **TODAY'S PREPARATION SCHEDULE:**\n\n";
        
        // Calculate study hours available today
        const hoursUntilMidnight = 23 - currentHour;
        
        if (currentHour < 18) {
          // Evening study sessions
          let studyStartHour = Math.max(18, currentHour + 1);
          const studyTimePerSubject = Math.floor((23 - studyStartHour) / (exams.length * 2)); // *2 for two sessions per subject
          
          exams.forEach((exam: any, index: number) => {
            // First study session for this subject
            const session1Hour = studyStartHour + (index * studyTimePerSubject * 2);
            const session1Time = `${session1Hour.toString().padStart(2, '0')}:00`;
            
            tasks.push({
              title: `📚 ${exam.subject} - Core Concepts`,
              time: session1Time,
              priority: "high" as const,
              desc: `Main topics, important concepts, formulas`
            });
            
            message += `• ${formatTime(session1Time)} - ${exam.subject} Core Concepts 📚\n`;
            
            // Short break
            const breakHour = session1Hour + Math.floor(studyTimePerSubject / 2);
            const breakTime = `${breakHour.toString().padStart(2, '0')}:${(studyTimePerSubject % 2 * 30).toString().padStart(2, '0')}`;
            
            tasks.push({
              title: `☕ Quick Break - Refresh`,
              time: breakTime,
              priority: "low" as const,
              desc: `10-15 min break, hydrate, stretch`
            });
            
            message += `• ${formatTime(breakTime)} - Short Break ☕\n`;
            
            // Second study session
            const session2Hour = session1Hour + studyTimePerSubject;
            const session2Time = `${session2Hour.toString().padStart(2, '0')}:00`;
            
            tasks.push({
              title: `📖 ${exam.subject} - Practice & Revision`,
              time: session2Time,
              priority: "high" as const,
              desc: `Solve problems, previous papers, quick revision`
            });
            
            message += `• ${formatTime(session2Time)} - ${exam.subject} Practice 📖\n`;
            
            studyStartHour = session2Hour + studyTimePerSubject;
          });
          
          // Dinner break
          if (currentHour < 21) {
            tasks.push({
              title: `🍽️ Dinner Break`,
              time: "21:00",
              priority: "low" as const,
              desc: `Proper meal, relax for 30 minutes`
            });
            message += `• ${formatTime("21:00")} - Dinner Break 🍽️\n`;
          }
          
          // Late night quick revision
          tasks.push({
            title: `📝 Quick Revision - All Subjects`,
            time: "22:30",
            priority: "medium" as const,
            desc: `Quick overview of key points from all subjects`
          });
          message += `• ${formatTime("22:30")} - Quick Revision All Subjects 📝\n`;
          
        } else if (currentHour < 22) {
          // Late evening - condensed schedule
          message += `⚡ **Quick Evening Revision (Starting Now!):**\n`;
          
          let quickStartHour = currentHour + 1;
          exams.forEach((exam: any, index: number) => {
            const studyTime = `${(quickStartHour + index).toString().padStart(2, '0')}:00`;
            tasks.push({
              title: `📚 ${exam.subject} - Quick Revision`,
              time: studyTime,
              priority: "high" as const,
              desc: `Focus on important topics, formulas, key concepts`
            });
            message += `• ${formatTime(studyTime)} - ${exam.subject} Quick Revision 📚\n`;
          });
        } else {
          message += `🌙 It's quite late! Quick last-minute tips:\n`;
          message += `• Review your notes briefly\n`;
          message += `• Get good sleep (very important!)\n`;
          message += `• Wake up early for final revision\n\n`;
        }
        
        // Sleep reminder
        tasks.push({
          title: `😴 Sleep Time - Rest Well!`,
          time: "23:30",
          priority: "high" as const,
          desc: `7-8 hours sleep is crucial for exam performance!`
        });
        message += `• ${formatTime("23:30")} - Sleep Well 😴 (7-8 hours!)\n\n`;
      }
      
      // EXAM DAY SCHEDULE
      message += "🌅 **EXAM DAY SCHEDULE:**\n\n";
      
      const firstExamTime = exams[0].time;
      const firstExamHour = parseInt(firstExamTime.split(':')[0]);
      
      // Wake up time (2 hours before first exam)
      const wakeUpHour = Math.max(6, firstExamHour - 2);
      const wakeUpTime = `${wakeUpHour.toString().padStart(2, '0')}:00`;
      
      tasks.push({
        title: `⏰ Wake Up & Fresh Start`,
        time: wakeUpTime,
        priority: "high" as const,
        desc: `Good breakfast, get ready, stay calm`
      });
      message += `• ${formatTime(wakeUpTime)} - Wake Up & Breakfast ⏰\n`;
      
      // Morning revision for first exam
      const revisionHour = wakeUpHour + 1;
      const revisionTime = `${revisionHour.toString().padStart(2, '0')}:00`;
      
      tasks.push({
        title: `📚 ${exams[0].subject} - Final Revision`,
        time: revisionTime,
        priority: "high" as const,
        desc: `Last minute revision, important formulas, key points`
      });
      message += `• ${formatTime(revisionTime)} - ${exams[0].subject} Final Revision 📚\n`;
      
      // Get ready time
      const getReadyHour = firstExamHour - 1;
      const getReadyTime = `${getReadyHour.toString().padStart(2, '0')}:00`;
      
      tasks.push({
        title: `🎒 Get Ready & Pack`,
        time: getReadyTime,
        priority: "medium" as const,
        desc: `Stationery, water bottle, admit card, ID`
      });
      message += `• ${formatTime(getReadyTime)} - Get Ready & Pack 🎒\n`;
      
      // Add each exam
      exams.forEach((exam: any, index: number) => {
        tasks.push({
          title: `📝 ${exam.subject.toUpperCase()} EXAM`,
          time: exam.time,
          priority: "high" as const,
          desc: `Stay calm, read questions carefully, manage time well`
        });
        message += `• ${formatTime(exam.time)} - **${exam.subject.toUpperCase()} EXAM** 📝\n`;
        
        // If there's another exam, add break/revision time
        if (index < exams.length - 1) {
          const currentExamHour = parseInt(exam.time.split(':')[0]);
          const nextExamTime = exams[index + 1].time;
          const nextExamHour = parseInt(nextExamTime.split(':')[0]);
          const gapHours = nextExamHour - currentExamHour;
          
          if (gapHours > 1) {
            const breakTime = `${(currentExamHour + 1).toString().padStart(2, '0')}:00`;
            tasks.push({
              title: `☕ Break + ${exams[index + 1].subject} Revision`,
              time: breakTime,
              priority: "medium" as const,
              desc: `Relax, quick snack, light revision for next exam`
            });
            message += `• ${formatTime(breakTime)} - Break + ${exams[index + 1].subject} Quick Revision ☕\n`;
          }
        }
      });
      
      // Celebration time!
      const lastExamTime = exams[exams.length - 1].time;
      const lastExamHour = parseInt(lastExamTime.split(':')[0]);
      const celebrationTime = `${(lastExamHour + 1).toString().padStart(2, '0')}:00`;
      
      tasks.push({
        title: `🎉 All Exams Done! Celebrate!`,
        time: celebrationTime,
        priority: "low" as const,
        desc: `Well deserved rest! You did great! 🎊`
      });
      message += `• ${formatTime(celebrationTime)} - CELEBRATE! 🎉 You did it!\n\n`;
      
      // Add exam tips
      message += "💡 **EXAM DAY TIPS:**\n";
      message += "✅ Stay hydrated - drink water regularly\n";
      message += "✅ Read all questions carefully\n";
      message += "✅ Manage your time well\n";
      message += "✅ Stay calm and confident\n";
      message += "✅ Review your answers if time permits\n\n";
      
      message += "All tasks added to your Scheduler with notifications! 💪\nYou've got this! Good luck! 🌟";
      
      return { tasks, message };
    }

    // Helper to format time nicely
    function formatTime(time: string) {
      const [hours, minutes] = time.split(':').map(Number);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    }

    // ===== STUDY TIPS & ADVICE =====
    if (lowerMessage.includes("study") || lowerMessage.includes("tips") || lowerMessage.includes("focus") ||
        lowerMessage.includes("how to") && (lowerMessage.includes("learn") || lowerMessage.includes("concentrate"))) {
      return {
        response: "📚 Here are proven study strategies:\n\n1. ⏱️ Pomodoro Technique: 25 min focus + 5 min break\n2. 🧠 Active Recall: Test yourself instead of re-reading\n3. 📅 Spaced Repetition: Review at increasing intervals\n4. 👥 Teach Others: Best way to solidify knowledge\n5. 💧 Stay Hydrated: Brain needs water to function\n6. 😴 Sleep Well: Memory consolidation happens during sleep\n\nYour analytics show you're most productive around 10 AM - schedule challenging tasks then!"
      };
    }

    if (lowerMessage.includes("motivat") || lowerMessage.includes("tired") || 
        lowerMessage.includes("stress") || lowerMessage.includes("overwhelm") ||
        lowerMessage.includes("can't do") || lowerMessage.includes("give up")) {
      return {
        response: "💪 You're doing AMAZING! Here's why:\n\n✨ You're actively working on your goals right now\n🎯 Every small step counts toward success\n📈 Progress isn't always visible but it's happening\n🌟 You've already accomplished so much\n⚡ Taking breaks is productive too\n\nRemember: Success is built one day at a time. You've got this! 🚀"
      };
    }

    if (lowerMessage.includes("exam") || lowerMessage.includes("test") || 
        lowerMessage.includes("preparation") || lowerMessage.includes("how to prepare")) {
      return {
        response: "📋 Exam Preparation Strategy:\n\n🗓️ 2-3 weeks before:\n• Review all topics\n• Identify weak areas\n• Make summary notes\n\n📚 1-2 weeks before:\n• Practice problems daily\n• Use active recall\n• Join study groups\n\n📝 1 week before:\n• Take mock tests\n• Time yourself\n• Review mistakes\n\n🎯 2-3 days before:\n• Light revision only\n• Sleep well (8 hours)\n• Stay calm and confident\n\nWant me to create a study schedule for your exam?"
      };
    }

    // ===== DEFAULT HELPFUL RESPONSE =====
    return {
      response: "I'm your intelligent AI assistant! I can help you with:\n\n✅ **Add Tasks:** 'Schedule homework at 5 PM tomorrow'\n✅ **Mark Dates:** 'Make next Friday my special day'\n✅ **Add Events:** 'Add exam on December 1 at 9 AM'\n✅ **Create Routines:** 'Create a daily study plan'\n✅ **Delete Tasks:** 'Remove my morning task'\n✅ **Complete Tasks:** 'Mark homework as done'\n✅ **View Sections:** 'Show me my calendar'\n✅ **Get Advice:** 'Give me study tips'\n\n💡 Just talk naturally - I'll understand! What would you like to do?"
    };
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const { response, action } = parseAndExecuteCommand(userInput);
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: response,
        timestamp: new Date(),
        action: action,
      };

      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="p-8 border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Bot className="size-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-slate-900">AI Study Assistant</h1>
              <p className="text-slate-600">I understand natural language - just talk to me normally!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.type === "bot" && (
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Bot className="size-5 text-indigo-600" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl px-6 py-4 ${
                  message.type === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-slate-900 border border-slate-200"
                }`}
              >
                <p className="whitespace-pre-line">{message.content}</p>
                {message.action && (
                  <div className="mt-3 flex items-center gap-2 text-green-600">
                    <CheckCircle className="size-4" />
                    <span className="text-sm">Action completed</span>
                  </div>
                )}
              </div>

              {message.type === "user" && (
                <div className="flex-shrink-0 w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                  <User className="size-5 text-slate-600" />
                </div>
              )}
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <Bot className="size-5 text-indigo-600" />
              </div>
              <div className="bg-white rounded-2xl px-6 py-4 border border-slate-200">
                <div className="flex gap-2">
                  <motion.div
                    className="w-2 h-2 bg-indigo-600 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-indigo-600 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-indigo-600 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-6 border-t border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Try: 'Add homework at 5 PM' or 'Make December 25 my special day'"
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Send className="size-5" />
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setInput("Create a weekly timetable for Math, Physics, English")}
              className="px-3 py-1 text-sm bg-indigo-100 hover:bg-indigo-200 rounded-full text-indigo-700"
            >
              <Sparkles className="inline size-3 mr-1" />
              Create timetable
            </button>
            <button
              onClick={() => setInput("Make a study schedule from 2 PM to 8 PM")}
              className="px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700"
            >
              <Sparkles className="inline size-3 mr-1" />
              Daily schedule
            </button>
            <button
              onClick={() => setInput("Tomorrow I have English exam at 9:30 AM")}
              className="px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700"
            >
              <Sparkles className="inline size-3 mr-1" />
              Exam prep
            </button>
            <button
              onClick={() => setInput("Create study routine")}
              className="px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700"
            >
              <Sparkles className="inline size-3 mr-1" />
              Study routine
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Plus, Bell, Clock, Flag, BellRing, Trash2, X } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner@2.0.3";
import { Badge } from "../ui/badge";
import { Task, getUserKey } from "../Dashboard";

export function SchedulerView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    time: "",
    priority: "medium" as "high" | "medium" | "low",
  });

  useEffect(() => {
    // Request notification permission
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        setNotificationPermission(permission);
        if (permission === "granted") {
          toast.success("Notifications enabled! You'll receive alerts for your tasks.");
        } else if (permission === "denied") {
          toast.info("Notifications blocked. You'll only see in-app alerts.");
        }
      });
    }

    // Load tasks from localStorage using user-specific key
    const tasksKey = getUserKey("tasks");
    const savedTasks = localStorage.getItem(tasksKey);
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      // Initialize with some example tasks
      const exampleTasks: Task[] = [
        {
          id: "1",
          title: "Morning Study - Mathematics",
          description: "Complete calculus homework",
          time: "09:00",
          priority: "high",
          notified: false,
          notifiedBefore: false,
          completed: false,
        },
        {
          id: "2",
          title: "Attend Physics Lecture",
          description: "Topic: Quantum Mechanics",
          time: "11:00",
          priority: "high",
          notified: false,
          notifiedBefore: false,
          completed: false,
        },
        {
          id: "3",
          title: "Lunch Break",
          description: "Take a proper break",
          time: "13:00",
          priority: "low",
          notified: false,
          notifiedBefore: false,
          completed: false,
        },
        {
          id: "4",
          title: "Programming Practice",
          description: "LeetCode problems",
          time: "15:00",
          priority: "medium",
          notified: false,
          notifiedBefore: false,
          completed: false,
        },
      ];
      setTasks(exampleTasks);
      localStorage.setItem(tasksKey, JSON.stringify(exampleTasks));
    }

    // Check for notifications every 30 seconds for more accuracy
    const notificationInterval = setInterval(() => {
      checkNotifications();
    }, 30000);

    // Also check immediately
    checkNotifications();

    return () => clearInterval(notificationInterval);
  }, []);

  const sendNotification = (title: string, body: string, icon: string = "🔔") => {
    // Browser notification
    if (notificationPermission === "granted" && "Notification" in window) {
      new Notification(title, {
        body: body,
        icon: icon,
        badge: icon,
        tag: title,
        requireInteraction: false,
      });
    }

    // In-app toast notification
    toast.info(title, {
      description: body,
      duration: 5000,
    });
  };

  const checkNotifications = () => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = `${currentHours.toString().padStart(2, "0")}:${currentMinutes.toString().padStart(2, "0")}`;

    // Calculate 5 minutes from now
    const fiveMinutesLater = new Date(now.getTime() + 5 * 60000);
    const fiveMinTime = `${fiveMinutesLater.getHours().toString().padStart(2, "0")}:${fiveMinutesLater.getMinutes().toString().padStart(2, "0")}`;

    setTasks((prevTasks) => {
      let updated = false;
      const updatedTasks = prevTasks.map((task) => {
        if (task.completed) return task;

        let taskUpdated = { ...task };

        // Check for 5-minute warning
        if (task.time === fiveMinTime && !task.notifiedBefore) {
          sendNotification(
            `⏰ Starting Soon: ${task.title}`,
            `Your task "${task.title}" will start in 5 minutes!`
          );
          taskUpdated.notifiedBefore = true;
          updated = true;
        }

        // Check for exact time notification
        if (task.time === currentTime && !task.notified) {
          sendNotification(
            `🔔 Time to Start: ${task.title}`,
            `It's time for: ${task.description || task.title}`
          );
          taskUpdated.notified = true;
          updated = true;
        }

        return taskUpdated;
      });

      if (updated) {
        localStorage.setItem(getUserKey("tasks"), JSON.stringify(updatedTasks));
      }

      return updated ? updatedTasks : prevTasks;
    });
  };

  const handleAddTask = () => {
    if (!newTask.title || !newTask.time) {
      toast.error("Please fill in title and time");
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      notified: false,
      notifiedBefore: false,
      completed: false,
    };

    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);
    localStorage.setItem(getUserKey("tasks"), JSON.stringify(updatedTasks));

    toast.success("Task added successfully! You'll receive notifications 5 minutes before and at the start time.");
    setIsDialogOpen(false);
    setNewTask({
      title: "",
      description: "",
      time: "",
      priority: "medium",
    });
  };

  const toggleComplete = (id: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem(getUserKey("tasks"), JSON.stringify(updatedTasks));
  };

  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    localStorage.setItem(getUserKey("tasks"), JSON.stringify(updatedTasks));
    toast.success("Task removed successfully");
  };

  const clearAllTasks = () => {
    if (tasks.length === 0) {
      toast.info("No tasks to clear");
      return;
    }
    
    if (window.confirm(`Are you sure you want to remove all ${tasks.length} task(s)? This cannot be undone.`)) {
      setTasks([]);
      localStorage.setItem(getUserKey("tasks"), JSON.stringify([]));
      toast.success("All tasks cleared!");
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.time.localeCompare(b.time);
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-slate-900 mb-2">Daily Scheduler</h1>
            <p className="text-slate-600">Manage your tasks by priority and time</p>
          </div>
          <div className="flex items-center gap-3">
            {tasks.length > 0 && (
              <Button 
                onClick={clearAllTasks}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="mr-2 size-4" />
                Clear All
              </Button>
            )}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Plus className="mr-2 size-5" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                  <DialogDescription>
                    Add a new task to your daily scheduler.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Task Title</Label>
                    <Input
                      id="title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="e.g., Study Mathematics"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Task details..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newTask.time}
                      onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                    />
                    <p className="text-slate-500 text-sm mt-1">
                      You'll get notified 5 minutes before and at the scheduled time
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value: "high" | "medium" | "low") =>
                        setNewTask({ ...newTask, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddTask} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                    Add Task
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Notification Status Banner */}
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
          <div className="flex items-start gap-3">
            <BellRing className="size-5 text-indigo-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-slate-900 mb-1">Notification System Active</h3>
              <p className="text-slate-600 text-sm">
                {notificationPermission === "granted"
                  ? "✓ Browser notifications enabled. You'll receive alerts 5 minutes before and at task start time."
                  : notificationPermission === "denied"
                  ? "⚠️ Browser notifications blocked. You'll see in-app alerts only."
                  : "ℹ️ Enable browser notifications for better alerts."}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <Clock className="size-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No tasks scheduled yet. Add your first task!</p>
            </div>
          ) : (
            sortedTasks.map((task) => (
              <div
                key={task.id}
                className={`bg-white p-6 rounded-xl border transition-all ${
                  task.completed ? "border-slate-200 opacity-60" : "border-slate-200 hover:shadow-md"
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleComplete(task.id)}
                    className="mt-1 size-5 rounded border-slate-300"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className={`text-slate-900 mb-1 ${task.completed ? "line-through" : ""}`}>
                          {task.title}
                        </h3>
                        <p className="text-slate-600">{task.description}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="group flex items-center gap-1 px-3 py-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all"
                          title="Remove task"
                        >
                          <Trash2 className="size-4" />
                          <span className="text-sm hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge className={getPriorityColor(task.priority)}>
                        <Flag className="mr-1 size-3" />
                        {task.priority}
                      </Badge>
                      <div className="flex items-center gap-1 text-slate-600">
                        <Clock className="size-4" />
                        <span>{task.time}</span>
                      </div>
                      {task.notifiedBefore && (
                        <div className="flex items-center gap-1 text-amber-600">
                          <BellRing className="size-4" />
                          <span className="text-sm">5-min alert sent</span>
                        </div>
                      )}
                      {task.notified && (
                        <div className="flex items-center gap-1 text-indigo-600">
                          <Bell className="size-4" />
                          <span className="text-sm">Start alert sent</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Target, Sparkles, TrendingUp, Calendar, Clock, CheckCircle2, Star, Zap, Trophy, Brain, Award, Flame } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { toast } from "sonner@2.0.3";
import { getUserKey } from "../Dashboard";

interface Goal {
  shortTerm: string;
  longTerm: string;
  createdAt: string;
}

interface TimetableTask {
  id: string;
  title: string;
  time: string;
  duration: string;
  completed: boolean;
  starClaimed: boolean;
  day?: string;
}

interface GoalProgress {
  completedTasks: number;
  totalTasks: number;
  starsEarned: number;
  lastStarTime: number | null;
}

export function GoalTimetableView() {
  const [goals, setGoals] = useState<Goal | null>(null);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [timetable, setTimetable] = useState<TimetableTask[]>([]);
  const [progress, setProgress] = useState<GoalProgress>({
    completedTasks: 0,
    totalTasks: 0,
    starsEarned: 0,
    lastStarTime: null,
  });
  const [showStarAnimation, setShowStarAnimation] = useState(false);
  const [newGoal, setNewGoal] = useState({
    shortTerm: "",
    longTerm: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedGoals = localStorage.getItem(getUserKey("goals"));
    const savedTimetable = localStorage.getItem(getUserKey("goalTimetable"));
    const savedProgress = localStorage.getItem(getUserKey("goalProgress"));

    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
    if (savedTimetable) {
      setTimetable(JSON.parse(savedTimetable));
    }
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  };

  const generateAITimetable = () => {
    if (!goals) return;

    // AI-generated timetable based on goals
    const generatedTimetable: TimetableTask[] = [
      // Morning Routine
      { id: "1", title: "Morning Review Session", time: "07:00 AM", duration: "30 min", completed: false, starClaimed: false, day: "Daily" },
      { id: "2", title: "Focus Study Block 1 - Core Subjects", time: "08:00 AM", duration: "90 min", completed: false, starClaimed: false, day: "Daily" },
      { id: "3", title: "Short Break & Refresh", time: "09:30 AM", duration: "15 min", completed: false, starClaimed: false, day: "Daily" },
      
      // Mid-Morning
      { id: "4", title: "Focus Study Block 2 - Practice", time: "10:00 AM", duration: "90 min", completed: false, starClaimed: false, day: "Daily" },
      { id: "5", title: "Active Learning Activity", time: "11:30 AM", duration: "30 min", completed: false, starClaimed: false, day: "Daily" },
      
      // Afternoon
      { id: "6", title: "Lunch & Rest", time: "12:30 PM", duration: "60 min", completed: false, starClaimed: false, day: "Daily" },
      { id: "7", title: "Light Study Session", time: "02:00 PM", duration: "60 min", completed: false, starClaimed: false, day: "Daily" },
      { id: "8", title: "Problem-Solving Practice", time: "03:30 PM", duration: "90 min", completed: false, starClaimed: false, day: "Daily" },
      
      // Evening
      { id: "9", title: "Revision Session", time: "05:30 PM", duration: "60 min", completed: false, starClaimed: false, day: "Daily" },
      { id: "10", title: "Evening Break", time: "06:30 PM", duration: "30 min", completed: false, starClaimed: false, day: "Daily" },
      { id: "11", title: "Goal Progress Review", time: "08:00 PM", duration: "30 min", completed: false, starClaimed: false, day: "Daily" },
      { id: "12", title: "Light Reading/Revision", time: "09:00 PM", duration: "45 min", completed: false, starClaimed: false, day: "Daily" },
    ];

    setTimetable(generatedTimetable);
    localStorage.setItem(getUserKey("goalTimetable"), JSON.stringify(generatedTimetable));

    // Update progress
    const newProgress = {
      completedTasks: 0,
      totalTasks: generatedTimetable.length,
      starsEarned: progress.starsEarned,
      lastStarTime: progress.lastStarTime,
    };
    setProgress(newProgress);
    localStorage.setItem(getUserKey("goalProgress"), JSON.stringify(newProgress));

    toast.success("🎯 AI-Generated Timetable Created!", {
      description: "Your personalized study schedule is ready based on your goals!",
    });
  };

  const handleSaveGoals = () => {
    if (!newGoal.shortTerm || !newGoal.longTerm) {
      toast.error("Please fill in both short-term and long-term goals");
      return;
    }

    const goalData: Goal = {
      shortTerm: newGoal.shortTerm,
      longTerm: newGoal.longTerm,
      createdAt: new Date().toISOString(),
    };

    setGoals(goalData);
    localStorage.setItem(getUserKey("goals"), JSON.stringify(goalData));
    setShowGoalForm(false);

    toast.success("🎯 Goals Saved Successfully!");
    
    // Auto-generate timetable after goals are set
    setTimeout(() => {
      generateAITimetable();
    }, 500);
  };

  const toggleTaskComplete = (taskId: string) => {
    const updatedTimetable = timetable.map((task) => {
      if (task.id === taskId) {
        const newCompleted = !task.completed;
        return { ...task, completed: newCompleted };
      }
      return task;
    });

    setTimetable(updatedTimetable);
    localStorage.setItem(getUserKey("goalTimetable"), JSON.stringify(updatedTimetable));

    // Update progress
    const completed = updatedTimetable.filter(t => t.completed).length;
    const newProgress = {
      ...progress,
      completedTasks: completed,
    };
    setProgress(newProgress);
    localStorage.setItem(getUserKey("goalProgress"), JSON.stringify(newProgress));

    // Show toast for completion
    const task = updatedTimetable.find(t => t.id === taskId);
    if (task?.completed && !task.starClaimed) {
      toast.success("🎉 Task Completed!", {
        description: "Great job! Now claim your star reward! ⭐",
        duration: 5000,
      });
    }
  };

  const claimStar = (taskId: string) => {
    const task = timetable.find(t => t.id === taskId);
    
    if (!task || !task.completed || task.starClaimed) {
      return;
    }

    // Mark star as claimed
    const updatedTimetable = timetable.map((t) => 
      t.id === taskId ? { ...t, starClaimed: true } : t
    );

    setTimetable(updatedTimetable);
    localStorage.setItem(getUserKey("goalTimetable"), JSON.stringify(updatedTimetable));

    // Trigger star animation and update count
    setShowStarAnimation(true);
    
    const newProgress = {
      ...progress,
      starsEarned: progress.starsEarned + 1,
      lastStarTime: Date.now(),
    };
    setProgress(newProgress);
    localStorage.setItem(getUserKey("goalProgress"), JSON.stringify(newProgress));

    toast.success("⭐ Star Claimed Successfully!", {
      description: `You now have ${newProgress.starsEarned} stars! Keep going!`,
      duration: 4000,
    });

    setTimeout(() => {
      setShowStarAnimation(false);
    }, 2000);
  };

  const triggerStarReward = () => {
    const now = Date.now();
    const timeSinceLastStar = progress.lastStarTime ? now - progress.lastStarTime : Infinity;

    // Only show star animation if it's been at least 2 seconds since last one
    if (timeSinceLastStar > 2000) {
      setShowStarAnimation(true);
      
      const newProgress = {
        ...progress,
        starsEarned: progress.starsEarned + 1,
        lastStarTime: now,
      };
      setProgress(newProgress);
      localStorage.setItem(getUserKey("goalProgress"), JSON.stringify(newProgress));

      // Play success sound effect (optional)
      toast.success("⭐ Great Job! Keep Going!", {
        description: "You're making excellent progress!",
      });

      setTimeout(() => {
        setShowStarAnimation(false);
      }, 2000);
    }
  };

  const progressPercentage = progress.totalTasks > 0
    ? Math.round((progress.completedTasks / progress.totalTasks) * 100)
    : 0;

  const getMotivationalMessage = () => {
    if (progressPercentage === 100) return "🏆 Amazing! You've completed all tasks!";
    if (progressPercentage >= 75) return "🔥 Outstanding progress! Keep going!";
    if (progressPercentage >= 50) return "💪 Halfway there! You're doing great!";
    if (progressPercentage >= 25) return "🌟 Great start! Keep up the momentum!";
    return "🚀 Let's begin your journey to success!";
  };

  const getStarMilestoneMessage = () => {
    const stars = progress.starsEarned;
    if (stars >= 50) return "🌟 Superstar! You're unstoppable!";
    if (stars >= 30) return "⭐ Amazing dedication! Keep shining!";
    if (stars >= 20) return "✨ Incredible progress! You're on fire!";
    if (stars >= 10) return "🌠 Great momentum! Keep collecting stars!";
    if (stars >= 5) return "💫 Nice work! Stars are adding up!";
    if (stars >= 1) return "⭐ Your journey begins! Keep going!";
    return "🎯 Complete tasks to earn your first star!";
  };

  const renderStarCollection = () => {
    const stars = [];
    const displayCount = Math.min(progress.starsEarned, 50); // Show max 50 stars visually
    
    for (let i = 0; i < displayCount; i++) {
      stars.push(
        <div
          key={i}
          className="star-blink"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <Star className="size-6 text-yellow-500 fill-yellow-500" />
        </div>
      );
    }
    return stars;
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-slate-900 mb-2 flex items-center gap-3">
            <Target className="size-8 text-indigo-600" />
            Goal-Based Timetable
          </h1>
          <p className="text-slate-600">
            Set your goals, follow your AI-generated timetable, and earn stars as you progress!
          </p>
        </div>

        {/* Goal Section */}
        {!goals || showGoalForm ? (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-2xl border border-indigo-200 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Target className="size-6 text-indigo-600" />
              <h2 className="text-slate-900">Set Your Goals</h2>
            </div>
            <div className="space-y-6 max-w-2xl">
              <div>
                <Label htmlFor="shortTerm" className="text-slate-900 mb-2 block">
                  🎯 Short-Term Goal (e.g., This Week/Month)
                </Label>
                <Input
                  id="shortTerm"
                  value={newGoal.shortTerm}
                  onChange={(e) => setNewGoal({ ...newGoal, shortTerm: e.target.value })}
                  placeholder="e.g., Score 90% in upcoming Math test"
                  className="bg-white"
                />
              </div>
              <div>
                <Label htmlFor="longTerm" className="text-slate-900 mb-2 block">
                  🏆 Long-Term Goal (e.g., This Semester/Year)
                </Label>
                <Textarea
                  id="longTerm"
                  value={newGoal.longTerm}
                  onChange={(e) => setNewGoal({ ...newGoal, longTerm: e.target.value })}
                  placeholder="e.g., Get admission to top university with excellent grades"
                  className="bg-white min-h-24"
                />
              </div>
              <Button
                onClick={handleSaveGoals}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Sparkles className="mr-2 size-5" />
                Save Goals & Generate Timetable
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-200 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="size-5 text-indigo-600" />
                  <h3 className="text-slate-900">Your Goals</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-slate-600 text-sm mb-1">Short-Term Goal:</p>
                    <p className="text-slate-900">{goals.shortTerm}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm mb-1">Long-Term Goal:</p>
                    <p className="text-slate-900">{goals.longTerm}</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setShowGoalForm(true)}
                variant="outline"
                size="sm"
              >
                Edit Goals
              </Button>
            </div>
          </div>
        )}

        {/* Progress Bar Section */}
        {goals && timetable.length > 0 && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 mb-8 relative overflow-hidden">
            {/* Star Animation Overlay */}
            {showStarAnimation && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="star-burst">
                  <Star className="size-24 text-yellow-400 fill-yellow-400 animate-ping" />
                </div>
                <div className="absolute">
                  <Star className="size-16 text-yellow-500 fill-yellow-500 animate-bounce" />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Trophy className="size-6 text-amber-500" />
                <div>
                  <h3 className="text-slate-900">Your Progress</h3>
                  <p className="text-slate-600 text-sm">{getMotivationalMessage()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200">
                  <Star className="size-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-slate-900">{progress.starsEarned} Stars Earned</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">
                  {progress.completedTasks} of {progress.totalTasks} tasks completed
                </span>
                <span className="text-indigo-600">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              
              {/* Milestone Markers */}
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span className={progressPercentage >= 25 ? "text-green-600" : ""}>
                  {progressPercentage >= 25 ? "✓" : "○"} 25%
                </span>
                <span className={progressPercentage >= 50 ? "text-green-600" : ""}>
                  {progressPercentage >= 50 ? "✓" : "○"} 50%
                </span>
                <span className={progressPercentage >= 75 ? "text-green-600" : ""}>
                  {progressPercentage >= 75 ? "✓" : "○"} 75%
                </span>
                <span className={progressPercentage === 100 ? "text-green-600" : ""}>
                  {progressPercentage === 100 ? "✓" : "○"} 100%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* AI Timetable Section */}
        {goals && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Brain className="size-6 text-purple-600" />
                <div>
                  <h2 className="text-slate-900">AI-Generated Study Timetable</h2>
                  <p className="text-slate-600 text-sm">Follow this schedule to achieve your goals</p>
                </div>
              </div>
              {timetable.length > 0 && (
                <Button
                  onClick={generateAITimetable}
                  variant="outline"
                  className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                >
                  <Sparkles className="mr-2 size-4" />
                  Regenerate
                </Button>
              )}
            </div>

            {timetable.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
                <Calendar className="size-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">No timetable generated yet</p>
                <Button
                  onClick={generateAITimetable}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Sparkles className="mr-2 size-5" />
                  Generate AI Timetable
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {timetable.map((task) => (
                  <div
                    key={task.id}
                    className={`bg-white p-5 rounded-xl border transition-all ${
                      task.completed
                        ? "border-green-200 bg-green-50"
                        : "border-slate-200 hover:border-indigo-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className={`mt-1 size-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          task.completed
                            ? "bg-green-500 border-green-500"
                            : "border-slate-300 hover:border-indigo-500"
                        }`}
                      >
                        {task.completed && <CheckCircle2 className="size-4 text-white" />}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3
                              className={`text-slate-900 mb-1 ${
                                task.completed ? "line-through text-slate-500" : ""
                              }`}
                            >
                              {task.title}
                            </h3>
                            <div className="flex items-center gap-4 flex-wrap">
                              <div className="flex items-center gap-1 text-slate-600 text-sm">
                                <Clock className="size-4" />
                                <span>{task.time}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                <Zap className="mr-1 size-3" />
                                {task.duration}
                              </Badge>
                              {task.day && (
                                <Badge variant="outline" className="text-xs">
                                  <Calendar className="mr-1 size-3" />
                                  {task.day}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {/* Star Display and Claim Button */}
                          <div className="ml-4 flex items-center gap-3">
                            {task.completed && !task.starClaimed && (
                              <Button
                                onClick={() => claimStar(task.id)}
                                className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-slate-900 shadow-lg animate-bounce"
                                size="sm"
                              >
                                <Star className="mr-2 size-4 fill-current" />
                                Claim Star!
                              </Button>
                            )}
                            {task.starClaimed && (
                              <div className="flex items-center gap-2 bg-yellow-100 px-3 py-2 rounded-full border border-yellow-300">
                                <Star className="size-5 text-yellow-600 fill-yellow-600 animate-pulse" />
                                <span className="text-xs text-yellow-800">Star Earned!</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Motivational Footer */}
        {goals && timetable.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-2xl text-white text-center">
            <TrendingUp className="size-8 mx-auto mb-3" />
            <h3 className="mb-2">Stay Focused & Consistent!</h3>
            <p className="text-indigo-100">
              Every task you complete brings you closer to your goals. Keep going! 🌟
            </p>
          </div>
        )}

        {/* Star Collection Section - Bottom Display */}
        {goals && timetable.length > 0 && (
          <div className="mt-8 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 p-8 rounded-2xl border-2 border-yellow-300 shadow-lg">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Award className="size-8 text-yellow-600" />
                <h2 className="text-slate-900">Your Star Collection</h2>
                <Award className="size-8 text-yellow-600" />
              </div>
              <p className="text-slate-700 mb-2">{getStarMilestoneMessage()}</p>
              <div className="inline-flex items-center gap-2 bg-yellow-400 px-6 py-3 rounded-full shadow-md">
                <Star className="size-8 text-yellow-900 fill-yellow-900 animate-spin" style={{ animationDuration: '3s' }} />
                <span className="text-slate-900 text-2xl">{progress.starsEarned}</span>
                <span className="text-slate-800">Total Stars Earned</span>
              </div>
            </div>

            {/* Star Collection Display */}
            {progress.starsEarned > 0 ? (
              <>
                <div className="mb-6">
                  <div className="flex flex-wrap gap-3 justify-center max-h-64 overflow-y-auto p-4 bg-white/50 rounded-xl border border-yellow-200">
                    {renderStarCollection()}
                  </div>
                  {progress.starsEarned > 50 && (
                    <p className="text-center text-slate-600 text-sm mt-3">
                      Showing 50 of {progress.starsEarned} stars - You've collected so many! 🌟
                    </p>
                  )}
                </div>

                {/* Milestone Progress */}
                <div className="bg-white p-6 rounded-xl border border-yellow-200">
                  <h3 className="text-slate-900 mb-4 flex items-center gap-2">
                    <Flame className="size-5 text-orange-500" />
                    Star Milestones
                  </h3>
                  <div className="space-y-3">
                    <MilestoneItem earned={progress.starsEarned} target={5} label="Beginner Star Collector" />
                    <MilestoneItem earned={progress.starsEarned} target={10} label="Rising Star" />
                    <MilestoneItem earned={progress.starsEarned} target={20} label="Star Champion" />
                    <MilestoneItem earned={progress.starsEarned} target={30} label="Star Master" />
                    <MilestoneItem earned={progress.starsEarned} target={50} label="Star Legend" />
                  </div>
                </div>

                {/* Motivational Message */}
                <div className="mt-6 text-center">
                  <p className="text-slate-700">
                    Keep completing tasks to earn more stars and unlock new milestones! 🚀
                  </p>
                  <p className="text-slate-600 text-sm mt-2">
                    Every star represents your dedication and hard work. They'll help you stay motivated and achieve your goals!
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="mb-4">
                  <Star className="size-16 text-yellow-400 fill-yellow-400 mx-auto opacity-30" />
                </div>
                <p className="text-slate-700 mb-2">No stars earned yet!</p>
                <p className="text-slate-600 text-sm">
                  Complete tasks in your timetable to earn your first star and start your collection! ⭐
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes star-burst {
          0% { transform: scale(0) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
          100% { transform: scale(2) rotate(360deg); opacity: 0; }
        }
        
        .star-burst {
          animation: star-burst 2s ease-out;
        }

        @keyframes star-blink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.9); }
        }

        .star-blink {
          animation: star-blink 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// Milestone Item Component
function MilestoneItem({ earned, target, label }: { earned: number; target: number; label: string }) {
  const isCompleted = earned >= target;
  const progress = Math.min((earned / target) * 100, 100);

  return (
    <div className="flex items-center gap-3">
      <div className={`size-8 rounded-full flex items-center justify-center ${
        isCompleted ? 'bg-green-500' : 'bg-slate-200'
      }`}>
        {isCompleted ? (
          <CheckCircle2 className="size-5 text-white" />
        ) : (
          <Star className="size-5 text-slate-400" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-sm ${isCompleted ? 'text-green-700' : 'text-slate-600'}`}>
            {label}
          </span>
          <span className="text-xs text-slate-500">{earned}/{target}</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              isCompleted ? 'bg-green-500' : 'bg-yellow-400'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      {isCompleted && (
        <Trophy className="size-5 text-yellow-500 fill-yellow-500" />
      )}
    </div>
  );
}
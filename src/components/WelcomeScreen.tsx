import { motion } from "motion/react";
import { Brain, Calendar, TrendingUp, MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

interface WelcomeScreenProps {
  onContinue: () => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-8">
      <motion.div
        className="max-w-4xl w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center space-y-6 mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Brain className="size-20 text-indigo-600 mx-auto mb-6" strokeWidth={1.5} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-slate-900 mb-4">
              Welcome to AI-Based Student <br />
              Productivity & Routine Optimizer
            </h1>
            <p className="text-slate-600 text-xl mb-6">
              Let's plan it, track it, and achieve it together!
            </p>
            <p className="text-indigo-600 italic">
              "Success is the sum of small efforts repeated day in and day out."
            </p>
          </motion.div>
        </div>

        <motion.div
          className="grid md:grid-cols-2 gap-6 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <Calendar className="size-10 text-indigo-600 mb-4" />
            <h3 className="text-slate-900 mb-2">Smart Scheduling</h3>
            <p className="text-slate-600">
              AI-powered time management with priority-based task scheduling and automatic notifications
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <TrendingUp className="size-10 text-purple-600 mb-4" />
            <h3 className="text-slate-900 mb-2">Progress Analytics</h3>
            <p className="text-slate-600">
              Track your study patterns, discover your most productive hours, and optimize your routine
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <MessageSquare className="size-10 text-pink-600 mb-4" />
            <h3 className="text-slate-900 mb-2">AI Chatbot Assistant</h3>
            <p className="text-slate-600">
              Get personalized study plans, routine suggestions, and instant answers to your questions
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <Calendar className="size-10 text-indigo-600 mb-4" />
            <h3 className="text-slate-900 mb-2">Event Tracking</h3>
            <p className="text-slate-600">
              Never miss a college event, deadline, or important date with our integrated calendar system
            </p>
          </div>
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            onClick={onContinue}
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 group"
          >
            Let's Work On It
            <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

import { motion } from "motion/react";
import { Brain, Calendar, BookOpen, Sparkles } from "lucide-react";

export function AnimatedLogo() {
  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* Outer rotating ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-indigo-200"
        animate={{ rotate: 360 }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {/* Sparkles on the ring */}
        <motion.div
          className="absolute -top-2 left-1/2 -translate-x-1/2"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Sparkles className="size-4 text-indigo-500" />
        </motion.div>
        <motion.div
          className="absolute top-1/2 -right-2 -translate-y-1/2"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0.5,
            ease: "easeInOut",
          }}
        >
          <Sparkles className="size-4 text-purple-500" />
        </motion.div>
      </motion.div>

      {/* Middle pulsing circle */}
      <motion.div
        className="absolute inset-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Center brain icon with pulse */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-30"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <Brain className="size-20 text-indigo-600 relative z-10" strokeWidth={1.5} />
        </div>
      </motion.div>

      {/* Orbiting icons */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: -360 }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {/* Calendar icon */}
        <motion.div
          className="absolute top-8 left-1/2 -translate-x-1/2"
          whileHover={{ scale: 1.2 }}
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            y: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          <div className="bg-white p-3 rounded-full shadow-lg">
            <Calendar className="size-6 text-purple-600" strokeWidth={2} />
          </div>
        </motion.div>

        {/* Book icon */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          whileHover={{ scale: 1.2 }}
          animate={{
            y: [0, 5, 0],
          }}
          transition={{
            y: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            },
          }}
        >
          <div className="bg-white p-3 rounded-full shadow-lg">
            <BookOpen className="size-6 text-indigo-600" strokeWidth={2} />
          </div>
        </motion.div>
      </motion.div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-indigo-400 rounded-full"
          style={{
            left: `${20 + i * 12}%`,
            top: `${30 + (i % 3) * 15}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

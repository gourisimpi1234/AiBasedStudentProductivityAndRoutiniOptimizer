import { useState, useEffect } from "react";
import { User, Cake, Mail, Book, Calendar, Sparkles, Gift, PartyPopper } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner@2.0.3";
import { motion } from "motion/react";
import { getUserKey } from "../Dashboard";

interface UserProfile {
  name: string;
  email: string;
  birthday: string;
  college: string;
  course: string;
  year: string;
  avatar?: string;
}

export function ProfileView() {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    birthday: "",
    college: "",
    course: "",
    year: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isBirthday, setIsBirthday] = useState(false);
  const [daysUntilBirthday, setDaysUntilBirthday] = useState<number | null>(null);

  useEffect(() => {
    // Load profile from localStorage using user-specific key
    const profileKey = getUserKey("userProfile");
    const savedProfile = localStorage.getItem(profileKey);
    const currentUser = localStorage.getItem("currentUser");
    
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setProfile(parsedProfile);
      checkBirthday(parsedProfile.birthday);
    } else if (currentUser) {
      // Only set email if there's a current logged-in user
      setProfile(prev => ({ ...prev, email: currentUser }));
      setIsEditing(true);
    }
  }, []);

  const checkBirthday = (birthdayStr: string) => {
    if (!birthdayStr) return;

    const today = new Date();
    const birthday = new Date(birthdayStr);
    
    // Set birthday to current year
    birthday.setFullYear(today.getFullYear());

    // Check if birthday is today
    if (
      today.getDate() === birthday.getDate() &&
      today.getMonth() === birthday.getMonth()
    ) {
      setIsBirthday(true);
      
      // Show birthday wishes only once per day
      const lastWishDate = localStorage.getItem("lastBirthdayWish");
      const todayStr = today.toDateString();
      
      if (lastWishDate !== todayStr) {
        setTimeout(() => {
          toast.success("🎉 Happy Birthday! 🎂", {
            description: "Wishing you an amazing year ahead filled with success and happiness!",
            duration: 10000,
          });
        }, 1000);
        localStorage.setItem("lastBirthdayWish", todayStr);
      }
    } else {
      setIsBirthday(false);
      
      // Calculate days until birthday
      if (birthday < today) {
        birthday.setFullYear(today.getFullYear() + 1);
      }
      
      const diffTime = birthday.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysUntilBirthday(diffDays);
    }
  };

  const handleSave = () => {
    if (!profile.name || !profile.birthday) {
      toast.error("Please fill in at least your name and birthday");
      return;
    }

    const profileKey = getUserKey("userProfile");
    localStorage.setItem(profileKey, JSON.stringify(profile));
    checkBirthday(profile.birthday);
    setIsEditing(false);
    toast.success("Profile saved successfully!");
  };

  const handleCancel = () => {
    const profileKey = getUserKey("userProfile");
    const savedProfile = localStorage.getItem(profileKey);
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
      setIsEditing(false);
    }
  };

  const getAge = () => {
    if (!profile.birthday) return null;
    const today = new Date();
    const birthDate = new Date(profile.birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = getAge();

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Birthday Celebration Banner */}
        {isBirthday && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-2xl p-8 text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-20">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    rotate: [0, 360],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                >
                  {i % 3 === 0 ? "🎂" : i % 3 === 1 ? "🎉" : "🎈"}
                </motion.div>
              ))}
            </div>

            <div className="relative z-10 text-center">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <Cake className="size-20 mx-auto mb-4" />
              </motion.div>
              <h1 className="text-white mb-4">🎉 Happy Birthday, {profile.name}! 🎉</h1>
              <p className="text-white text-xl mb-2">
                Wishing you an incredible year ahead filled with success, happiness, and achievement!
              </p>
              <p className="text-white/90">
                May all your dreams come true and may you reach new heights in your academic journey! 🌟
              </p>
              {age && (
                <motion.div
                  className="mt-4 inline-block bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <p className="text-white">Celebrating {age} amazing years! 🎊</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Upcoming Birthday Countdown */}
        {!isBirthday && daysUntilBirthday !== null && daysUntilBirthday <= 30 && (
          <div className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-full">
                <Gift className="size-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-slate-900 mb-1">Your Birthday is Coming!</h3>
                <p className="text-slate-600">
                  {daysUntilBirthday === 1
                    ? "🎉 Tomorrow is your special day!"
                    : `Only ${daysUntilBirthday} days until your birthday! 🎂`}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-slate-900 mb-2">My Profile</h1>
            <p className="text-slate-600">Manage your personal information</p>
          </div>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleCancel} variant="outline">
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-8">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-200">
            <div className="size-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white">
              {profile.name ? (
                <span className="text-3xl">{profile.name.charAt(0).toUpperCase()}</span>
              ) : (
                <User className="size-12" />
              )}
            </div>
            <div>
              <h2 className="text-slate-900 mb-1">{profile.name || "Your Name"}</h2>
              <p className="text-slate-600">{profile.email}</p>
              {age && (
                <p className="text-slate-500 text-sm mt-1">
                  <Cake className="inline size-4 mr-1" />
                  {age} years old
                </p>
              )}
            </div>
          </div>

          {/* Profile Form */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 size-5 text-slate-400" />
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Enter your full name"
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 size-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="pl-10 bg-slate-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthday">Birthday *</Label>
              <div className="relative">
                <Cake className="absolute left-3 top-3 size-5 text-slate-400" />
                <Input
                  id="birthday"
                  type="date"
                  value={profile.birthday}
                  onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
              <p className="text-slate-500 text-sm">We'll wish you on your special day!</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Academic Year</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 size-5 text-slate-400" />
                <Input
                  id="year"
                  value={profile.year}
                  onChange={(e) => setProfile({ ...profile, year: e.target.value })}
                  placeholder="e.g., 2nd Year"
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="college">College/University</Label>
              <div className="relative">
                <Book className="absolute left-3 top-3 size-5 text-slate-400" />
                <Input
                  id="college"
                  value={profile.college}
                  onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                  placeholder="Enter your college name"
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course">Course/Major</Label>
              <div className="relative">
                <Book className="absolute left-3 top-3 size-5 text-slate-400" />
                <Input
                  id="course"
                  value={profile.course}
                  onChange={(e) => setProfile({ ...profile, course: e.target.value })}
                  placeholder="e.g., Computer Science"
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Motivational Section */}
          {!isEditing && profile.name && (
            <div className="mt-8 pt-8 border-t border-slate-200">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <Sparkles className="size-6 text-indigo-600 mt-1" />
                  <div>
                    <h3 className="text-slate-900 mb-2">Keep Going, {profile.name.split(" ")[0]}! 💪</h3>
                    <p className="text-slate-600 mb-3">
                      You're doing amazing work managing your time and staying productive. Every day is a step
                      closer to your goals!
                    </p>
                    <p className="text-indigo-600 italic">
                      "Success is the sum of small efforts repeated day in and day out."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
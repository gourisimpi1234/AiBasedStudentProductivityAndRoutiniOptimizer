import { useState, useEffect } from "react";
import { ImportantDate, getUserKey } from "../Dashboard";
import { Calendar } from "../ui/calendar";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "../ui/button";

export function CalendarView() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [importantDates, setImportantDates] = useState<ImportantDate[]>([]);

  useEffect(() => {
    const datesKey = getUserKey("importantDates");
    const savedDates = localStorage.getItem(datesKey);
    if (savedDates) {
      setImportantDates(JSON.parse(savedDates));
    }
  }, []);

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthYear = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Get important dates for selected date
  const selectedDateStr = date?.toISOString().split("T")[0];
  const importantForSelectedDate = importantDates.filter(d => d.date === selectedDateStr);

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-slate-900 mb-2">Calendar</h1>
          <p className="text-slate-600">View and manage your schedule</p>
        </div>

        {importantDates.length > 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Star className="size-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="text-slate-900 mb-2">Important Dates</h3>
                <div className="flex flex-wrap gap-2">
                  {importantDates.map((impDate) => (
                    <div key={impDate.id} className="text-sm bg-white px-3 py-1 rounded-full border border-amber-200">
                      {new Date(impDate.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {impDate.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-slate-900">{monthYear}</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                <ChevronLeft className="size-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleNextMonth}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="rounded-md"
          />

          {date && (
            <div className="mt-8 p-6 bg-indigo-50 rounded-xl">
              <h3 className="text-slate-900 mb-4">
                Events on {date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </h3>
              
              {importantForSelectedDate.length > 0 && (
                <div className="mb-4">
                  {importantForSelectedDate.map((impDate) => (
                    <div key={impDate.id} className="bg-amber-100 p-4 rounded-lg mb-3 border border-amber-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="size-4 text-amber-600" />
                        <p className="text-slate-900">{impDate.title}</p>
                      </div>
                      <p className="text-slate-600 text-sm">{impDate.description}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-slate-900 mb-1">Morning Study Session</p>
                  <p className="text-slate-600">09:00 AM - 11:00 AM</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-slate-900 mb-1">Physics Lecture</p>
                  <p className="text-slate-600">11:00 AM - 12:30 PM</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
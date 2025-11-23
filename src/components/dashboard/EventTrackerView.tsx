import { useState, useEffect } from "react";
import { Plus, Calendar as CalendarDays, MapPin, Tag } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner@2.0.3";
import { Badge } from "../ui/badge";
import { CollegeEvent, getUserKey } from "../Dashboard";

export function EventTrackerView() {
  const [events, setEvents] = useState<CollegeEvent[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    type: "academic" as "academic" | "cultural" | "sports" | "other",
  });

  useEffect(() => {
    const eventsKey = getUserKey("collegeEvents");
    const savedEvents = localStorage.getItem(eventsKey);
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      toast.error("Please fill in required fields");
      return;
    }

    const event: CollegeEvent = {
      id: Date.now().toString(),
      ...newEvent,
    };

    const updatedEvents = [...events, event];
    setEvents(updatedEvents);
    localStorage.setItem(getUserKey("collegeEvents"), JSON.stringify(updatedEvents));

    toast.success("Event added successfully!");
    setIsDialogOpen(false);
    setNewEvent({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      type: "academic",
    });
  };

  const deleteEvent = (id: string) => {
    const updatedEvents = events.filter((event) => event.id !== id);
    setEvents(updatedEvents);
    localStorage.setItem(getUserKey("collegeEvents"), JSON.stringify(updatedEvents));
    toast.success("Event deleted");
  };

  const sortedEvents = [...events].sort((a, b) => {
    return new Date(a.date + " " + a.time).getTime() - new Date(b.date + " " + b.time).getTime();
  });

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "academic":
        return "bg-blue-100 text-blue-700";
      case "cultural":
        return "bg-purple-100 text-purple-700";
      case "sports":
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
            <h1 className="text-slate-900 mb-2">College Events Tracker</h1>
            <p className="text-slate-600">Stay updated with all campus events and activities</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="mr-2 size-5" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add College Event</DialogTitle>
                <DialogDescription>Enter the details of the event you want to add.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="eventTitle">Event Title</Label>
                  <Input
                    id="eventTitle"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="e.g., Annual Tech Fest"
                  />
                </div>
                <div>
                  <Label htmlFor="eventDescription">Description</Label>
                  <Textarea
                    id="eventDescription"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Event details..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventDate">Date</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventTime">Time</Label>
                    <Input
                      id="eventTime"
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="eventLocation">Location</Label>
                  <Input
                    id="eventLocation"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="e.g., Main Auditorium"
                  />
                </div>
                <div>
                  <Label htmlFor="eventType">Type</Label>
                  <Select
                    id="eventType"
                    value={newEvent.type}
                    onValueChange={(value) => setNewEvent({ ...newEvent, type: value as "academic" | "cultural" | "sports" | "other" })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select event type">
                        {newEvent.type}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="cultural">Cultural</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddEvent} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                  Add Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {sortedEvents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <CalendarDays className="size-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No events scheduled. Add your first college event!</p>
            </div>
          ) : (
            sortedEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <Badge className={getEventTypeColor(event.type)}>{event.type}</Badge>
                      <h3 className="text-slate-900">{event.title}</h3>
                    </div>
                    <p className="text-slate-600 mb-4">{event.description}</p>
                    <div className="flex flex-wrap gap-4 text-slate-600">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="size-4" />
                        <span>
                          {new Date(event.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span>at {event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="text-slate-400 hover:text-red-600 ml-4"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
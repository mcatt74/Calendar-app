import * as React from "react"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { CalendarIcon } from "lucide-react"

interface Event {
  id: string
  name: string
  time: string
  datetime: string
}

interface AddEventModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: Date
  onAddEvent: (event: Omit<Event, 'id'>) => Promise<void>
}

export function AddEventModal({ open, onOpenChange, selectedDate, onAddEvent }: AddEventModalProps) {
  const [eventName, setEventName] = React.useState("")
  const [eventDate, setEventDate] = React.useState(format(selectedDate, "yyyy-MM-dd"))
  const [eventDuration, setEventDuration] = React.useState<"full-day" | "half-day">("full-day")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Update the event date when selectedDate prop changes
  React.useEffect(() => {
    setEventDate(format(selectedDate, "yyyy-MM-dd"))
  }, [selectedDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Form submitted with:', { eventName, eventDate, eventDuration })
    
    if (!eventName.trim()) {
      alert("Please fill in the event name")
      return
    }

    if (isSubmitting) {
      console.log('Already submitting, ignoring click')
      return
    }

    setIsSubmitting(true)

    try {
      const timeDisplay = eventDuration === "full-day" ? "All Day" : "Half Day"
      // Create datetime string in local timezone to avoid date shifting
      const datetime = `${eventDate}T12:00:00`
      
      console.log('Calling onAddEvent with:', { name: eventName.trim(), time: timeDisplay, datetime })
      
      console.log('About to call onAddEvent...')
      await onAddEvent({
        name: eventName.trim(),
        time: timeDisplay,
        datetime: datetime
      })

      console.log('Event added successfully, closing modal')
      
      // Reset form
      setEventName("")
      setEventDate(format(selectedDate, "yyyy-MM-dd"))
      setEventDuration("full-day")
      onOpenChange(false)
    } catch (error) {
      console.error('Error adding event:', error)
      alert('Failed to add event. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setEventName("")
    setEventDate(format(selectedDate, "yyyy-MM-dd"))
    setEventDuration("full-day")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event-name">Event Name</Label>
            <Input
              id="event-name"
              type="text"
              placeholder="Enter event name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-date">Date</Label>
            <div className="relative">
              <Input
                id="event-date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
                className="text-center pr-10 [&::-webkit-calendar-picker-indicator]:hidden"
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('event-date') as HTMLInputElement | null;
                  input?.showPicker();
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <CalendarIcon size={20} />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Duration</Label>
            <div className="flex space-x-4">
              <label className={`flex-1 flex items-center justify-center px-4 py-2 border-2 rounded cursor-pointer transition-all ${
                eventDuration === "full-day" 
                  ? "border-blue-500 ring-2 ring-blue-200 bg-blue-50" 
                  : "border-gray-300 hover:border-gray-400"
              }`}>
                <input
                  type="radio"
                  name="duration"
                  value="full-day"
                  checked={eventDuration === "full-day"}
                  onChange={(e) => setEventDuration(e.target.value as "full-day")}
                  className="sr-only"
                />
                <span className="text-sm font-medium">Full-Day</span>
              </label>
              <label className={`flex-1 flex items-center justify-center px-4 py-2 border-2 rounded cursor-pointer transition-all ${
                eventDuration === "half-day" 
                  ? "border-blue-500 ring-2 ring-blue-200 bg-blue-50" 
                  : "border-gray-300 hover:border-gray-400"
              }`}>
                <input
                  type="radio"
                  name="duration"
                  value="half-day"
                  checked={eventDuration === "half-day"}
                  onChange={(e) => setEventDuration(e.target.value as "half-day")}
                  className="sr-only"
                />
                <span className="text-sm font-medium">Half-Day</span>
              </label>
            </div>
          </div>


          <div className="flex justify-center space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="outline" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

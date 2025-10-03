"use client"

import * as React from "react"
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfToday,
  startOfWeek,
} from "date-fns"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusCircleIcon,
  SearchIcon,
  XIcon,
} from "lucide-react"

import { cn } from "../lib/utils"
import { Button } from "../components/ui/button"
import { Separator } from "../components/ui/separator"
import { useMediaQuery } from "../hooks/use-media-query"
import { AddEventModal } from "../components/AddEventModal"
import { SignInForm } from "../components/SignInForm"
import { UserProfileForm } from "../components/UserProfileForm"
import { useAuth } from "../lib/auth-context"
import { EventsService } from "../lib/events-service"
import { LogOutIcon, UserIcon } from "lucide-react"

interface Event {
  id: string
  name: string
  time: string
  datetime: string
  user_id?: string
}

interface CalendarData {
  day: Date
  events: Event[]
}

interface FullScreenCalendarProps {
  data: CalendarData[]
  onAddEvent: (event: Omit<Event, 'id'>) => Promise<void>
  onDeleteEvent: (eventId: string) => Promise<void>
}

const colStartClasses = [
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
]

function FullScreenCalendar({ data, onAddEvent, onDeleteEvent }: FullScreenCalendarProps) {
  const today = startOfToday()
  const [selectedDay, setSelectedDay] = React.useState(today)
  const [currentMonth, setCurrentMonth] = React.useState(
    format(today, "MMM-yyyy"),
  )
  const [isAddEventModalOpen, setIsAddEventModalOpen] = React.useState(false)
  const [selectedDateForEvent, setSelectedDateForEvent] = React.useState(today)
  const [showProfile, setShowProfile] = React.useState(false)
  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date())
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const { signOut, user, profile } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  const days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth),
    end: endOfWeek(endOfMonth(firstDayCurrentMonth)),
  })

  function previousMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 })
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
  }

  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 })
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
  }

  function goToToday() {
    setCurrentMonth(format(today, "MMM-yyyy"))
  }

  function handleAddEventToDate(date: Date) {
    setSelectedDateForEvent(date)
    setIsAddEventModalOpen(true)
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Calendar Header */}
      <div className="flex flex-col space-y-4 p-6 md:flex-row md:items-center md:justify-evenly md:space-y-0 lg:flex-none border-b border-gray-200">
        <div className="flex flex-auto">
          <div className="flex items-center gap-4">
            <div className="hidden w-20 flex-col items-center justify-center rounded-lg border border-gray-300 bg-gray-50 p-0.5 md:flex">
              <h1 className="p-1 text-xs uppercase text-gray-600">
                {format(today, "MMM")}
              </h1>
              <div className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white p-0.5 text-lg font-bold text-gray-900">
                <span>{format(today, "d")}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <h2 className="text-2xl font-semibold text-gray-900">
                {format(firstDayCurrentMonth, "MMMM, yyyy")}
              </h2>
              <p className="text-sm text-gray-600">
                {format(firstDayCurrentMonth, "MMM d, yyyy")} -{" "}
                {format(endOfMonth(firstDayCurrentMonth), "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {profile ? (
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full border border-gray-300"
                  style={{ backgroundColor: profile.color }}
                />
                <span>Welcome {profile.first_name}</span>
              </div>
            ) : (
              <span>Welcome, {user?.email}</span>
            )}
          </div>

          <div className="inline-flex w-full -space-x-px rounded-lg shadow-sm shadow-black/5 md:w-auto rtl:space-x-reverse">
            <Button
              onClick={previousMonth}
              className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
              variant="outline"
              size="icon"
              aria-label="Navigate to previous month"
            >
              <ChevronLeftIcon size={16} strokeWidth={2} aria-hidden="true" />
            </Button>
            <Button
              onClick={goToToday}
              className="w-full rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 md:w-auto"
              variant="outline"
            >
              Month
            </Button>
            <Button
              onClick={nextMonth}
              className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
              variant="outline"
              size="icon"
              aria-label="Navigate to next month"
            >
              <ChevronRightIcon size={16} strokeWidth={2} aria-hidden="true" />
            </Button>
          </div>

          <Separator orientation="vertical" className="hidden h-6 md:block" />
          <Separator
            orientation="horizontal"
            className="block w-full md:hidden"
          />

          <Button 
            className="w-full gap-2 md:w-auto bg-black hover:bg-gray-800 text-white border-black hover:border-gray-800"
            onClick={() => handleAddEventToDate(selectedDay)}
          >
            <PlusCircleIcon size={16} strokeWidth={2} aria-hidden="true" />
            <span>New Event</span>
          </Button>

          <Button 
            variant="outline"
            className="w-full gap-2 md:w-auto"
            onClick={() => setShowProfile(true)}
          >
            <UserIcon size={16} strokeWidth={2} aria-hidden="true" />
            <span>Profile</span>
          </Button>

          <Button 
            variant="outline"
            className="w-full gap-2 md:w-auto"
            onClick={handleSignOut}
          >
            <LogOutIcon size={16} strokeWidth={2} aria-hidden="true" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-200 text-center text-sm font-semibold leading-6 bg-gray-50 text-gray-700">
          <div className="border-r border-gray-200 py-3">Sun</div>
          <div className="border-r border-gray-200 py-3">Mon</div>
          <div className="border-r border-gray-200 py-3">Tue</div>
          <div className="border-r border-gray-200 py-3">Wed</div>
          <div className="border-r border-gray-200 py-3">Thu</div>
          <div className="border-r border-gray-200 py-3">Fri</div>
          <div className="py-3">Sat</div>
        </div>

        {/* Calendar Days */}
        <div className="flex-1 flex text-sm leading-6 overflow-hidden">
          <div className="hidden w-full border-x border-gray-200 lg:grid lg:grid-cols-7 lg:grid-rows-5 bg-white">
            {days.map((day, dayIdx) =>
              !isDesktop ? (
                <button
                  onClick={() => setSelectedDay(day)}
                  key={dayIdx}
                  type="button"
                  className={cn(
                    isEqual(day, selectedDay) && "text-white",
                    !isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      isSameMonth(day, firstDayCurrentMonth) &&
                      "text-gray-900",
                    !isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      !isSameMonth(day, firstDayCurrentMonth) &&
                      "text-gray-400",
                    (isEqual(day, selectedDay) || isToday(day)) &&
                      "font-semibold",
                    "flex h-full flex-col border-b border-r border-gray-200 px-3 py-2 hover:bg-gray-50 focus:z-10",
                  )}
                >
                  <time
                    dateTime={format(day, "yyyy-MM-dd")}
                    className={cn(
                      "ml-auto flex size-6 items-center justify-center rounded-full",
                      isEqual(day, selectedDay) &&
                        isToday(day) &&
                        "bg-blue-600 text-white",
                      isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        "bg-blue-600 text-white",
                      !isEqual(day, selectedDay) &&
                        isToday(day) &&
                        "bg-blue-100 text-blue-600",
                    )}
                  >
                    {format(day, "d")}
                  </time>
                  {data.filter((date) => isSameDay(date.day, day)).length >
                    0 && (
                    <div>
                      {data
                        .filter((date) => isSameDay(date.day, day))
                        .map((date) => (
                          <div
                            key={date.day.toString()}
                            className="-mx-0.5 mt-auto flex flex-wrap-reverse"
                          >
                            {date.events.map((event) => (
                              <span
                                key={event.id}
                                className="mx-0.5 mt-1 h-1.5 w-1.5 rounded-full"
                                style={{ backgroundColor: profile?.color || '#3B82F6' }}
                              />
                            ))}
                          </div>
                        ))}
                    </div>
                  )}
                </button>
              ) : (
                <div
                  key={dayIdx}
                  className={cn(
                    dayIdx === 0 && colStartClasses[getDay(day)],
                    !isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      !isSameMonth(day, firstDayCurrentMonth) &&
                      "bg-gray-50 text-gray-400",
                    "relative flex flex-col border-b border-r border-gray-200 hover:bg-gray-50 focus:z-10 group",
                    !isEqual(day, selectedDay) && "hover:bg-gray-50",
                  )}
                >
                  <header className="flex items-center justify-between p-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={cn(
                        isEqual(day, selectedDay) && "text-white",
                        !isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          isSameMonth(day, firstDayCurrentMonth) &&
                          "text-gray-900",
                        !isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          !isSameMonth(day, firstDayCurrentMonth) &&
                          "text-gray-400",
                        isEqual(day, selectedDay) &&
                          isToday(day) &&
                          "border-none bg-blue-600",
                        isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          "bg-blue-600",
                        !isEqual(day, selectedDay) &&
                          isToday(day) &&
                          "bg-blue-100 text-blue-600",
                        (isEqual(day, selectedDay) || isToday(day)) &&
                          "font-semibold",
                        "flex h-7 w-7 items-center justify-center rounded-full text-xs hover:border hover:border-gray-300",
                      )}
                    >
                      <time dateTime={format(day, "yyyy-MM-dd")}>
                        {format(day, "d")}
                      </time>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddEventToDate(day)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded-full"
                      title="Add event to this date"
                    >
                      <PlusCircleIcon size={14} className="text-gray-600" />
                    </button>
                  </header>
                  <div className="flex-1 pt-0 pb-1.5 px-1.5">
                    {data
                      .filter((event) => isSameDay(event.day, day))
                      .map((day) => (
                        <div key={day.day.toString()} className="space-y-0.5">
                          {day.events.slice(0, 3).map((event) => (
                            <div
                              key={event.id}
                              className="flex flex-col items-start gap-0.5 rounded border px-1 py-0.5 text-xs leading-tight group relative"
                              style={{ 
                                borderColor: profile?.color || '#3B82F6',
                                backgroundColor: `${profile?.color || '#3B82F6'}20`
                              }}
                            >
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  if (confirm(`Are you sure you want to delete "${event.name}"?`)) {
                                    await onDeleteEvent(event.id)
                                  }
                                }}
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded-full"
                                title="Delete event"
                              >
                                <XIcon size={12} className="text-red-600" />
                              </button>
                              <p className="font-medium leading-none text-gray-900 pr-4">
                                {event.name}
                              </p>
                              <p 
                                className="leading-none"
                                style={{ color: profile?.color || '#3B82F6' }}
                              >
                                {event.time}
                              </p>
                            </div>
                          ))}
                          {day.events.length > 3 && (
                            <div className="text-xs text-gray-600">
                              + {day.events.length - 3} more
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ),
            )}
          </div>

          <div className="isolate grid w-full grid-cols-7 grid-rows-5 border-x border-gray-200 lg:hidden bg-white">
            {days.map((day, dayIdx) => (
              <button
                onClick={() => setSelectedDay(day)}
                key={dayIdx}
                type="button"
                className={cn(
                  isEqual(day, selectedDay) && "text-white",
                  !isEqual(day, selectedDay) &&
                    !isToday(day) &&
                    isSameMonth(day, firstDayCurrentMonth) &&
                    "text-gray-900",
                  !isEqual(day, selectedDay) &&
                    !isToday(day) &&
                    !isSameMonth(day, firstDayCurrentMonth) &&
                    "text-gray-400",
                  (isEqual(day, selectedDay) || isToday(day)) &&
                    "font-semibold",
                  "flex h-14 flex-col border-b border-r border-gray-200 px-3 py-2 hover:bg-gray-50 focus:z-10 group relative",
                )}
              >
                <div className="flex items-center justify-center w-full">
                  <time
                    dateTime={format(day, "yyyy-MM-dd")}
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full",
                      isEqual(day, selectedDay) &&
                        isToday(day) &&
                        "bg-blue-600 text-white",
                      isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        "bg-blue-600 text-white",
                      !isEqual(day, selectedDay) &&
                        isToday(day) &&
                        "bg-blue-100 text-blue-600",
                    )}
                  >
                    {format(day, "d")}
                  </time>
                </div>
                {data.filter((date) => isSameDay(date.day, day)).length > 0 && (
                  <div>
                    {data
                      .filter((date) => isSameDay(date.day, day))
                      .map((date) => (
                        <div
                          key={date.day.toString()}
                          className="-mx-0.5 mt-auto flex flex-wrap-reverse"
                        >
                          {date.events.map((event) => (
                            <span
                              key={event.id}
                              className="mx-0.5 mt-1 h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: profile?.color || '#3B82F6' }}
                            />
                          ))}
                        </div>
                      ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      <AddEventModal
        open={isAddEventModalOpen}
        onOpenChange={setIsAddEventModalOpen}
        selectedDate={selectedDateForEvent}
        onAddEvent={onAddEvent}
      />

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">User Profile</h2>
                <button
                  onClick={() => setShowProfile(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XIcon size={20} />
                </button>
              </div>
              <UserProfileForm />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Sample calendar data for testing
const sampleData: CalendarData[] = [
  {
    day: new Date(2024, 11, 21), // December 21st
    events: [
      {
        id: "sample-1",
        name: "21st Dev Meeting",
        time: "10:00 AM",
        datetime: "2024-12-21T10:00:00"
      },
      {
        id: "sample-2",
        name: "Code Review",
        time: "2:00 PM",
        datetime: "2024-12-21T14:00:00"
      }
    ]
  },
  {
    day: new Date(2024, 11, 22), // December 22nd
    events: [
      {
        id: "sample-3",
        name: "Sprint Planning",
        time: "9:00 AM",
        datetime: "2024-12-22T09:00:00"
      }
    ]
  },
  {
    day: new Date(2024, 11, 25), // December 25th
    events: [
      {
        id: "sample-4",
        name: "Holiday Break",
        time: "All Day",
        datetime: "2024-12-25T00:00:00"
      }
    ]
  }
]

export default function Page() {
  const { user, loading } = useAuth()
  const [events, setEvents] = React.useState<CalendarData[]>([])
  const [eventsLoading, setEventsLoading] = React.useState(false)

  // Load events when user changes
  React.useEffect(() => {
    if (user) {
      loadEvents()
    } else {
      setEvents([])
    }
  }, [user])

  const loadEvents = async () => {
    if (!user) return
    
    setEventsLoading(true)
    try {
      const userEvents = await EventsService.getEvents(user.id)
      setEvents(userEvents)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setEventsLoading(false)
    }
  }

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show sign-in form if user is not authenticated
  if (!user) {
    return <SignInForm />
  }

  const handleAddEvent = async (newEvent: Omit<Event, 'id'>) => {
    if (!user) {
      console.error('No user found when trying to add event')
      return
    }
    
    console.log('handleAddEvent called with:', newEvent)
    console.log('User ID:', user.id)
    
    try {
      const savedEvent = await EventsService.addEvent(user.id, newEvent)
      console.log('Event saved:', savedEvent)
      
      if (savedEvent) {
        console.log('Reloading events...')
        // Reload events from database to ensure consistency
        await loadEvents()
        console.log('Events reloaded successfully')
      } else {
        console.error('Failed to save event - no event returned')
      }
    } catch (error) {
      console.error('Error adding event:', error)
      throw error // Re-throw so the modal can handle it
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const success = await EventsService.deleteEvent(eventId)
      if (success) {
        // Reload events from database to ensure consistency
        await loadEvents()
      }
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  return (
    <div className="h-screen w-full bg-white overflow-hidden">
      <div className="h-full flex flex-col">
        <div className="flex-shrink-0 p-6 border-b border-gray-200">
          <h1 className="text-4xl font-bold text-gray-900">Grassroots Calendar</h1>
        </div>
        <div className="flex-1 overflow-hidden">
          <FullScreenCalendar data={events} onAddEvent={handleAddEvent} onDeleteEvent={handleDeleteEvent} />
        </div>
      </div>
    </div>
  )
}

import { supabase } from './supabase'

export interface Event {
  id: string
  name: string
  time: string
  datetime: string
  user_id?: string
}

export interface CalendarData {
  day: Date
  events: Event[]
}

export class EventsService {
  // Get all events for a user
  static async getEvents(userId: string): Promise<CalendarData[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', userId)
        .order('datetime', { ascending: true })

      if (error) {
        console.error('Error fetching events:', error)
        return []
      }

      // Group events by date
      const eventsByDate: { [key: string]: Event[] } = {}
      
      data?.forEach((event) => {
        // Extract date directly from the datetime string to avoid timezone issues
        // Format: "2024-12-21T12:00:00" -> "2024-12-21"
        const dateKey = event.datetime.split('T')[0]
        
        if (!eventsByDate[dateKey]) {
          eventsByDate[dateKey] = []
        }
        
        eventsByDate[dateKey].push({
          id: event.id,
          name: event.name,
          time: event.time,
          datetime: event.datetime,
          user_id: event.user_id
        })
      })

      // Convert to CalendarData format
      const calendarData: CalendarData[] = Object.entries(eventsByDate).map(([dateKey, events]) => {
        // Parse the date key back to a Date object
        const [year, month, day] = dateKey.split('-').map(Number)
        const dayDate = new Date(year, month - 1, day) // month is 0-indexed
        
        return {
          day: dayDate,
          events
        }
      })

      return calendarData
    } catch (err) {
      console.error('Error:', err)
      return []
    }
  }

  // Add a new event
  static async addEvent(userId: string, event: Omit<Event, 'id' | 'user_id'>): Promise<Event | null> {
    try {
      console.log('EventsService.addEvent called with:', { userId, event })
      
      const { data, error } = await supabase
        .from('events')
        .insert({
          user_id: userId,
          name: event.name,
          time: event.time,
          datetime: event.datetime
        })
        .select()
        .single()

      console.log('Supabase insert result:', { data, error })

      if (error) {
        console.error('Error adding event:', error)
        return null
      }

      const result = {
        id: data.id,
        name: data.name,
        time: data.time,
        datetime: data.datetime,
        user_id: data.user_id
      }
      
      console.log('Event created successfully:', result)
      return result
    } catch (err) {
      console.error('Error:', err)
      return null
    }
  }

  // Delete an event
  static async deleteEvent(eventId: string): Promise<boolean> {
    try {
      console.log('EventsService.deleteEvent called with eventId:', eventId)
      
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      console.log('Supabase delete result:', { error })

      if (error) {
        console.error('Error deleting event:', error)
        return false
      }

      console.log('Event deleted successfully from database')
      return true
    } catch (err) {
      console.error('Error:', err)
      return false
    }
  }
}

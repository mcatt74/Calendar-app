"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { ColorPicker } from './ui/color-picker'

interface UserProfile {
  id: string
  email: string
  first_name: string
  username: string
  color: string
}

export function UserProfileForm() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form fields
  const [firstName, setFirstName] = useState('')
  const [username, setUsername] = useState('')
  const [color, setColor] = useState('#3B82F6')

  useEffect(() => {
    if (user) {
      // Add a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        if (loading) {
          console.log('Profile loading timeout, stopping loading state')
          setLoading(false)
        }
      }, 10000) // 10 second timeout

      fetchProfile()

      return () => clearTimeout(timeout)
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      console.log('Fetching profile for user:', user?.id)
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      console.log('Profile fetch result:', { data, error })

      if (error) {
        // If no profile exists, create one
        if (error.code === 'PGRST116' || error.message.includes('No rows returned') || error.message.includes('relation') || error.message.includes('does not exist')) {
          console.log('No profile found, creating new one...')
          await createProfile()
          return
        }
        console.error('Error fetching profile:', error)
        setError('Failed to load profile: ' + error.message)
        setLoading(false)
        return
      }

      if (data) {
        console.log('Profile loaded successfully:', data)
        setProfile(data)
        setFirstName(data.first_name || '')
        setUsername(data.username || '')
        setColor(data.color || '#3B82F6')
      } else {
        console.log('No data returned, creating new profile...')
        // Create a new profile if none exists
        await createProfile()
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to load profile: ' + (err as Error).message)
      setLoading(false)
    }
  }

  const createProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          first_name: 'User',
          username: `user${Date.now()}`,
          color: '#3B82F6'
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
        setError('Failed to create profile')
        setLoading(false)
        return
      }

      setProfile(data)
      setFirstName(data.first_name)
      setUsername(data.username)
      setColor(data.color)
      setLoading(false)
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to create profile')
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          first_name: firstName,
          username: username,
          color: color,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        console.error('Error updating profile:', error)
        setError('Failed to update profile')
        return
      }

      setSuccess('Profile updated successfully!')
      setProfile(prev => prev ? { ...prev, first_name: firstName, username, color } : null)
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-sm text-gray-500">Loading profile...</p>
        <div className="flex gap-2 mt-4">
          <button 
            onClick={() => {
              setLoading(true)
              setError(null)
              fetchProfile()
            }}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Retry
          </button>
          <button 
            onClick={() => {
              setLoading(false)
              // Set default values if loading fails
              setFirstName('User')
              setUsername(`user${Date.now()}`)
              setColor('#3B82F6')
            }}
            className="text-xs text-gray-600 hover:text-gray-800 underline"
          >
            Use Default Values
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h2>
      
      <form onSubmit={handleSave} className="space-y-6">
        {/* Email (read-only) */}
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={user?.email || ''}
            disabled
            className="bg-gray-50"
          />
        </div>

        {/* First Name */}
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter your first name"
            required
          />
        </div>

        {/* Username */}
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="Enter your username"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Only letters, numbers, and underscores allowed
          </p>
        </div>

        {/* Color Picker */}
        <ColorPicker
          value={color}
          onChange={setColor}
        />

        {/* Error/Success Messages */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="text-sm text-green-800">{success}</div>
          </div>
        )}

        {/* Save Button */}
        <Button
          type="submit"
          disabled={saving || !firstName || !username}
          className="w-full"
        >
          {saving ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </div>
          ) : (
            'Save Profile'
          )}
        </Button>
      </form>

      {/* Profile Preview */}
      {profile && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full border border-gray-300"
              style={{ backgroundColor: color }}
            />
            <span className="font-medium">{firstName}</span>
            <span className="text-gray-500">(@{username})</span>
          </div>
        </div>
      )}
    </div>
  )
}

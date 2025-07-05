"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, Square, Plus, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface Session {
  id: string
  skill: string
  duration: number
  startTime: Date
  endTime: Date
}

interface Skill {
  name: string
  totalTime: number
}

export default function WorkHourTracker() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSkill, setCurrentSkill] = useState<string>("")
  const [newSkill, setNewSkill] = useState<string>("")
  const [isTracking, setIsTracking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedSkills = localStorage.getItem("work-tracker-skills")
    const savedSessions = localStorage.getItem("work-tracker-sessions")

    if (savedSkills) {
      setSkills(JSON.parse(savedSkills))
    }
    if (savedSessions) {
      setSessions(
        JSON.parse(savedSessions).map((s: any) => ({
          ...s,
          startTime: new Date(s.startTime),
          endTime: new Date(s.endTime),
        })),
      )
    }
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("work-tracker-skills", JSON.stringify(skills))
  }, [skills])

  useEffect(() => {
    localStorage.setItem("work-tracker-sessions", JSON.stringify(sessions))
  }, [sessions])

  // Timer logic
  useEffect(() => {
    if (isTracking && !isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isTracking, isPaused])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const addSkill = () => {
    if (newSkill.trim() && !skills.find((s) => s.name === newSkill.trim())) {
      setSkills([...skills, { name: newSkill.trim(), totalTime: 0 }])
      setNewSkill("")
    }
  }

  const startTracking = () => {
    if (!currentSkill) return
    setIsTracking(true)
    setIsPaused(false)
    setStartTime(new Date())
    setCurrentTime(0)
  }

  const pauseTracking = () => {
    setIsPaused(!isPaused)
  }

  const stopTracking = () => {
    if (!currentSkill || !startTime) return

    const endTime = new Date()
    const session: Session = {
      id: Date.now().toString(),
      skill: currentSkill,
      duration: currentTime,
      startTime,
      endTime,
    }

    setSessions([session, ...sessions])

    // Update skill total time
    setSkills(
      skills.map((skill) =>
        skill.name === currentSkill ? { ...skill, totalTime: skill.totalTime + currentTime } : skill,
      ),
    )

    setIsTracking(false)
    setIsPaused(false)
    setCurrentTime(0)
    setStartTime(null)
  }

  const getTodaySessions = () => {
    const today = new Date().toDateString()
    return sessions.filter((session) => session.startTime.toDateString() === today)
  }

  return (
    <div className="min-h-screen bg-white text-black p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-2xl font-light tracking-wide">worklog</h1>
        <div className="w-16 h-px bg-black mx-auto mt-2"></div>
      </div>

      {/* Add New Skill */}
      <Card className="p-6 mb-8 border border-gray-200 shadow-none">
        <div className="flex gap-2">
          <Input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add new skill..."
            className="border-gray-300 focus:border-black"
            onKeyPress={(e) => e.key === "Enter" && addSkill()}
          />
          <Button
            onClick={addSkill}
            variant="outline"
            size="icon"
            className="border-gray-300 hover:bg-gray-100 bg-transparent"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Skill Selection */}
      {skills.length > 0 && (
        <Card className="p-6 mb-8 border border-gray-200 shadow-none">
          <h3 className="text-sm font-medium mb-4 tracking-wide">SELECT SKILL</h3>
          <div className="grid gap-2">
            {skills.map((skill) => (
              <button
                key={skill.name}
                onClick={() => setCurrentSkill(skill.name)}
                className={`p-3 text-left border transition-colors ${
                  currentSkill === skill.name
                    ? "border-black bg-black text-white"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-sm opacity-70">{formatTime(skill.totalTime)}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Timer */}
      {currentSkill && (
        <Card className="p-8 mb-8 border border-gray-200 shadow-none text-center">
          <div className="mb-4">
            <div className="text-sm font-medium tracking-wide mb-2">{currentSkill.toUpperCase()}</div>
            <div className="text-4xl font-light font-mono">{formatTime(currentTime)}</div>
          </div>

          <div className="flex justify-center gap-4">
            {!isTracking ? (
              <Button onClick={startTracking} className="bg-black hover:bg-gray-800 text-white">
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
            ) : (
              <>
                <Button
                  onClick={pauseTracking}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-100 bg-transparent"
                >
                  {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                  {isPaused ? "Resume" : "Pause"}
                </Button>
                <Button
                  onClick={stopTracking}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-100 bg-transparent"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Today's Sessions */}
      {getTodaySessions().length > 0 && (
        <Card className="p-6 border border-gray-200 shadow-none">
          <h3 className="text-sm font-medium mb-4 tracking-wide flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            TODAY'S SESSIONS
          </h3>
          <div className="space-y-3">
            {getTodaySessions().map((session) => (
              <div
                key={session.id}
                className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
              >
                <div>
                  <div className="font-medium">{session.skill}</div>
                  <div className="text-sm text-gray-600">
                    {session.startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                    {session.endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <div className="font-mono text-sm">{formatTime(session.duration)}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center font-medium">
              <span>Total Today</span>
              <span className="font-mono">
                {formatTime(getTodaySessions().reduce((total, session) => total + session.duration, 0))}
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

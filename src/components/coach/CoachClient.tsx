'use client'
// src/components/coach/CoachClient.tsx
import { useState, useRef, useEffect } from 'react'
import type { Profile, CoachConversation, CoachMessage } from '@/types'
import { cn } from '@/lib/utils'
import { Send, Bot, User, Plus, Loader2, Zap, MessageSquare } from 'lucide-react'

interface Props {
  profile: Profile | null
  conversations: CoachConversation[]
  skillNodes: Array<{ id: string; name: string; domain_id: string }>
}

const SESSION_TYPES = [
  { id: 'general', label: 'General Help', icon: '💬', desc: 'Questions, concepts, career advice' },
  { id: 'lesson', label: 'Teach Me', icon: '📚', desc: 'Explain a skill in depth' },
  { id: 'exercise', label: 'Guide Exercise', icon: '🏋️', desc: 'Help me solve a problem' },
  { id: 'interview', label: 'Interview Prep', icon: '🎯', desc: 'Practice interview questions' },
  { id: 'career', label: 'Career Strategy', icon: '🧭', desc: 'Path planning and priorities' },
] as const

const QUICK_PROMPTS = [
  'What should I study next to maximize my internship chances?',
  'Explain SQL window functions with a business example',
  'Give me a hard SQL interview question',
  'Review my understanding of pandas groupby',
  'What do hiring managers actually look for in a DA portfolio?',
  'Explain the STAR method for behavioral interviews',
]

export function CoachClient({ profile, conversations, skillNodes }: Props) {
  const [messages, setMessages] = useState<CoachMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionType, setSessionType] = useState<string>('general')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [contextSkillId, setContextSkillId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function newConversation() {
    setMessages([])
    setConversationId(null)
    setInput('')
  }

  async function sendMessage(text?: string) {
    const messageText = text ?? input.trim()
    if (!messageText || loading) return

    const userMsg: CoachMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          message: messageText,
          conversationId,
          sessionType,
          contextSkillId,
        }),
      })
      const data = await res.json()

      if (data.success) {
        const assistantMsg: CoachMessage = {
          role: 'assistant',
          content: data.data.response,
          timestamp: new Date().toISOString(),
        }
        setMessages(prev => [...prev, assistantMsg])
        if (data.data.conversationId && !conversationId) {
          setConversationId(data.data.conversationId)
        }
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toISOString(),
        }])
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Connection error. Please check your connection and try again.',
        timestamp: new Date().toISOString(),
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)] animate-fade-in">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-3">
        {/* New chat */}
        <button
          onClick={newConversation}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#00D4FF15] border border-[#00D4FF44] text-[#00D4FF] text-sm font-medium hover:bg-[#00D4FF25] transition-all"
        >
          <Plus className="w-4 h-4" />
          New Conversation
        </button>

        {/* Session type */}
        <div className="mission-card p-3 space-y-1">
          <div className="text-xs font-mono text-[#8892A4] uppercase tracking-wider mb-2 px-1">Mode</div>
          {SESSION_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setSessionType(type.id)}
              className={cn(
                'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all',
                sessionType === type.id
                  ? 'bg-[#00D4FF15] text-white border border-[#00D4FF30]'
                  : 'text-[#8892A4] hover:text-white hover:bg-[#ffffff08]'
              )}
            >
              <span className="text-base">{type.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium">{type.label}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Skill context */}
        <div className="mission-card p-3">
          <div className="text-xs font-mono text-[#8892A4] uppercase tracking-wider mb-2">Skill Context</div>
          <select
            value={contextSkillId ?? ''}
            onChange={e => setContextSkillId(e.target.value || null)}
            className="w-full bg-[#0A0F1E] border border-[#1E2D45] rounded-lg px-3 py-2 text-xs text-[#8892A4] focus:outline-none focus:border-[#00D4FF44]"
          >
            <option value="">No specific skill</option>
            {skillNodes.map(node => (
              <option key={node.id} value={node.id}>{node.name}</option>
            ))}
          </select>
        </div>

        {/* Recent conversations */}
        {conversations.length > 0 && (
          <div className="mission-card p-3">
            <div className="text-xs font-mono text-[#8892A4] uppercase tracking-wider mb-2">Recent</div>
            <div className="space-y-1">
              {conversations.slice(0, 5).map(conv => (
                <div key={conv.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#ffffff08] cursor-pointer">
                  <MessageSquare className="w-3.5 h-3.5 text-[#374151] flex-shrink-0" />
                  <span className="text-xs text-[#374151] truncate">
                    {conv.session_type} · {new Date(conv.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col mission-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#1E2D45] flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#00D4FF15] border border-[#00D4FF33] flex items-center justify-center">
            <Bot className="w-4 h-4 text-[#00D4FF]" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">AI Career Coach</div>
            <div className="text-xs font-mono text-[#8892A4]">
              {SESSION_TYPES.find(t => t.id === sessionType)?.desc}
              {contextSkillId && ` · ${skillNodes.find(n => n.id === contextSkillId)?.name}`}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#39FF14]" />
            <span className="text-xs font-mono text-[#8892A4]">Active</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isEmpty && (
            <div className="flex flex-col items-center justify-center h-full text-center pb-12">
              <div className="w-16 h-16 rounded-2xl bg-[#00D4FF10] border border-[#00D4FF25] flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-[#00D4FF]" />
              </div>
              <h3 className="text-white font-semibold mb-2">Your AI Career Coach</h3>
              <p className="text-sm text-[#8892A4] max-w-sm mb-8 leading-relaxed">
                Ask anything about SQL, Python, business analysis, or career strategy.
                Every answer is focused on getting you hired.
              </p>

              {/* Quick prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {QUICK_PROMPTS.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-left text-xs text-[#8892A4] hover:text-white bg-[#0A0F1E] hover:bg-[#111827] border border-[#1E2D45] hover:border-[#2A3F5A] rounded-lg px-3 py-2.5 transition-all"
                  >
                    <Zap className="w-3 h-3 inline mr-1.5 text-[#00D4FF]" />
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'flex gap-3 animate-fade-in',
                msg.role === 'user' && 'flex-row-reverse'
              )}
            >
              {/* Avatar */}
              <div className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
                msg.role === 'assistant'
                  ? 'bg-[#00D4FF15] border border-[#00D4FF30]'
                  : 'bg-[#1E2D45]'
              )}>
                {msg.role === 'assistant'
                  ? <Bot className="w-3.5 h-3.5 text-[#00D4FF]" />
                  : <User className="w-3.5 h-3.5 text-[#8892A4]" />
                }
              </div>

              {/* Bubble */}
              <div className={cn(
                'max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed',
                msg.role === 'assistant'
                  ? 'bg-[#0A0F1E] border border-[#1E2D45] text-white'
                  : 'bg-[#00D4FF15] border border-[#00D4FF30] text-white'
              )}>
                {/* Render markdown-ish formatting */}
                <div
                  className="prose prose-sm prose-invert max-w-none"
                  style={{
                    fontFamily: msg.role === 'assistant' ? 'inherit' : 'inherit',
                  }}
                >
                  {msg.content.split('\n').map((line, li) => {
                    if (line.startsWith('```')) return null
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <p key={li} className="font-semibold text-[#00D4FF]">{line.replace(/\*\*/g, '')}</p>
                    }
                    if (line.startsWith('- ') || line.startsWith('• ')) {
                      return <p key={li} className="pl-3 text-[#8892A4]">· {line.slice(2)}</p>
                    }
                    if (line.trim() === '') return <br key={li} />
                    return <p key={li}>{line}</p>
                  })}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#00D4FF15] border border-[#00D4FF30] flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5 text-[#00D4FF]" />
              </div>
              <div className="bg-[#0A0F1E] border border-[#1E2D45] rounded-xl px-4 py-3 flex items-center gap-1.5">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-[#00D4FF]"
                      style={{ animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-[#1E2D45]">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => {
                  setInput(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask your coach anything... (Enter to send, Shift+Enter for newline)"
                rows={1}
                className="w-full bg-[#0A0F1E] border border-[#1E2D45] rounded-xl px-4 py-3 text-sm text-white placeholder-[#374151] focus:outline-none focus:border-[#00D4FF44] resize-none overflow-hidden transition-all"
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#00D4FF] hover:bg-[#00B8E0] disabled:opacity-40 disabled:cursor-not-allowed text-[#0A0F1E] transition-all flex-shrink-0"
              style={{ boxShadow: '0 0 12px rgba(0,212,255,0.4)' }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-[#374151] font-mono mt-2 text-center">
            Powered by Claude · Focused on getting you hired
          </p>
        </div>
      </div>
    </div>
  )
}

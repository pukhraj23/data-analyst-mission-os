'use client'
// src/components/interviews/InterviewsClient.tsx
import { useState } from 'react'
import type { InterviewQuestion, UserInterviewAttempt, MockInterviewSession } from '@/types'
import { cn } from '@/lib/utils'
import { MockInterviewPanel } from './MockInterviewPanel'
import { Mic2, BookOpen, BarChart3, Target, ChevronRight } from 'lucide-react'

interface Props {
  questions: InterviewQuestion[]
  attempts: UserInterviewAttempt[]
  sessions: MockInterviewSession[]
}

const CATEGORIES = ['all', 'sql', 'pandas', 'business_case', 'behavioral'] as const
type Category = typeof CATEGORIES[number]

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All Questions',
  sql: 'SQL',
  pandas: 'Python/Pandas',
  business_case: 'Business Case',
  behavioral: 'Behavioral',
}

export function InterviewsClient({ questions, attempts, sessions }: Props) {
  const [activeTab, setActiveTab] = useState<'practice' | 'mock'>('practice')
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [activeDifficulty, setActiveDifficulty] = useState<number | 'all'>('all')
  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion | null>(null)

  const filteredQuestions = questions.filter(q => {
    const catMatch = activeCategory === 'all' || q.category === activeCategory
    const diffMatch = activeDifficulty === 'all' || q.difficulty === activeDifficulty
    return catMatch && diffMatch
  })

  function getAttemptForQuestion(qId: string) {
    return attempts
      .filter(a => a.question_id === qId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
  }

  // Stats
  const attempted = new Set(attempts.map(a => a.question_id)).size
  const passed = attempts.filter(a => (a.score ?? 0) >= 65)
  const avgScore = passed.length > 0
    ? Math.round(passed.reduce((s, a) => s + (a.score ?? 0), 0) / passed.length)
    : 0
  const completedSessions = sessions.filter(s => s.status === 'completed')

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Interview Preparation</h1>
        <p className="text-[#8892A4] text-sm mt-0.5 font-mono">
          Practice real interview questions · AI evaluates your answers in real time
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Questions Attempted', value: attempted, color: '#00D4FF', icon: BookOpen },
          { label: 'Avg Score (Passed)', value: avgScore ? `${avgScore}%` : '—', color: '#39FF14', icon: BarChart3 },
          { label: 'Mock Sessions', value: completedSessions.length, color: '#8B5CF6', icon: Mic2 },
          {
            label: 'Mock Pass Rate',
            value: completedSessions.length > 0
              ? `${Math.round((completedSessions.filter(s => (s.overall_score ?? 0) >= 65).length / completedSessions.length) * 100)}%`
              : '—',
            color: '#F59E0B',
            icon: Target,
          },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="mission-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color: stat.color }} />
                <span className="text-xs font-mono text-[#8892A4]">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold font-mono" style={{ color: stat.color }}>
                {stat.value}
              </div>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#1E2D45] pb-0">
        {(['practice', 'mock'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px',
              activeTab === tab
                ? 'text-[#00D4FF] border-[#00D4FF]'
                : 'text-[#8892A4] border-transparent hover:text-white'
            )}
          >
            {tab === 'practice' ? 'Question Bank' : 'Mock Interview'}
          </button>
        ))}
      </div>

      {activeTab === 'practice' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-mono transition-all',
                  activeCategory === cat
                    ? 'bg-[#00D4FF15] text-[#00D4FF] border border-[#00D4FF44]'
                    : 'text-[#8892A4] border border-[#1E2D45] hover:border-[#2A3F5A] hover:text-white'
                )}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
            <div className="ml-auto flex gap-2">
              {['all', 1, 2, 3, 4, 5].map(diff => (
                <button
                  key={diff}
                  onClick={() => setActiveDifficulty(diff as typeof activeDifficulty)}
                  className={cn(
                    'px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all',
                    activeDifficulty === diff
                      ? 'bg-[#00D4FF15] text-[#00D4FF] border border-[#00D4FF44]'
                      : 'text-[#374151] border border-[#1E2D45] hover:text-[#8892A4]'
                  )}
                >
                  {diff === 'all' ? 'All' : `L${diff}`}
                </button>
              ))}
            </div>
          </div>

          {/* Question count */}
          <div className="text-xs font-mono text-[#8892A4]">
            {filteredQuestions.length} questions
            {attempted > 0 && ` · ${attempted} attempted`}
          </div>

          {/* Questions grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filteredQuestions.map(question => (
              <QuestionCard
                key={question.id}
                question={question}
                attempt={getAttemptForQuestion(question.id)}
                onSelect={() => setSelectedQuestion(question)}
                isSelected={selectedQuestion?.id === question.id}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'mock' && (
        <MockInterviewPanel sessions={sessions} />
      )}

      {/* Question modal */}
      {selectedQuestion && activeTab === 'practice' && (
        <QuestionPracticeModal
          question={selectedQuestion}
          attempt={getAttemptForQuestion(selectedQuestion.id)}
          onClose={() => setSelectedQuestion(null)}
        />
      )}
    </div>
  )
}

// ---- Question Card ----
function QuestionCard({
  question, attempt, onSelect, isSelected
}: {
  question: InterviewQuestion
  attempt: UserInterviewAttempt | undefined
  onSelect: () => void
  isSelected: boolean
}) {
  const attempted = !!attempt
  const passed = (attempt?.score ?? 0) >= 65

  const categoryColors: Record<string, string> = {
    sql: '#3B82F6', pandas: '#F59E0B', business_case: '#8B5CF6', behavioral: '#10B981', default: '#6B7280',
  }
  const color = categoryColors[question.category] ?? categoryColors.default

  return (
    <button
      onClick={onSelect}
      className={cn(
        'mission-card p-4 text-left w-full transition-all',
        isSelected && 'border-[#00D4FF44]'
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[10px] font-mono px-2 py-0.5 rounded"
            style={{ color, backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
          >
            {question.category.toUpperCase().replace('_', ' ')}
          </span>
          <span className="text-[10px] font-mono text-[#374151]">L{question.difficulty}</span>
          {attempted && (
            <span className={cn(
              'text-[10px] font-mono px-2 py-0.5 rounded',
              passed
                ? 'bg-[#39FF1415] text-[#39FF14] border border-[#39FF1430]'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            )}>
              {passed ? '✓ Passed' : `${attempt?.score ?? 0}%`}
            </span>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-[#374151] flex-shrink-0 mt-0.5" />
      </div>
      <p className="text-sm text-white leading-snug line-clamp-2">{question.question}</p>
    </button>
  )
}

// ---- Question Practice Modal ----
function QuestionPracticeModal({
  question, attempt, onClose
}: {
  question: InterviewQuestion
  attempt: UserInterviewAttempt | undefined
  onClose: () => void
}) {
  const [answer, setAnswer] = useState('')
  const [evaluating, setEvaluating] = useState(false)
  const [evaluation, setEvaluation] = useState<{
    score: number; feedback: string; strengths: string[]; improvements: string[]; passed: boolean
  } | null>(attempt ? {
    score: attempt.score ?? 0,
    feedback: attempt.ai_feedback ?? '',
    strengths: [],
    improvements: [],
    passed: (attempt.score ?? 0) >= 65,
  } : null)

  async function evaluate() {
    if (!answer.trim()) return
    setEvaluating(true)
    const res = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'evaluate_answer',
        question: question.question,
        userAnswer: answer,
        sampleAnswer: question.sample_answer,
        keyPoints: question.key_points,
        category: question.category,
        questionId: question.id,
      }),
    })
    const data = await res.json()
    if (data.success) setEvaluation(data.data)
    setEvaluating(false)
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(10,15,30,0.9)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-[#111827] border border-[#1E2D45] rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-[#1E2D45] flex justify-between items-start">
          <div>
            <div className="text-xs font-mono text-[#8892A4] uppercase mb-1">
              {question.category.replace('_', ' ')} · Level {question.difficulty}
            </div>
            <p className="text-base font-semibold text-white leading-snug">{question.question}</p>
          </div>
          <button onClick={onClose} className="text-[#374151] hover:text-white ml-4 flex-shrink-0">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Answer input */}
          <div>
            <label className="text-xs font-mono text-[#8892A4] uppercase tracking-wider block mb-2">
              Your Answer
            </label>
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Type your answer here. Be specific — vague answers score poorly."
              rows={6}
              className="w-full bg-[#0A0F1E] border border-[#1E2D45] rounded-lg px-4 py-3 text-sm text-white placeholder-[#374151] focus:outline-none focus:border-[#00D4FF44] resize-none font-mono leading-relaxed"
            />
          </div>

          <button
            onClick={evaluate}
            disabled={evaluating || !answer.trim()}
            className="w-full flex items-center justify-center gap-2 bg-[#00D4FF] hover:bg-[#00B8E0] disabled:opacity-50 text-[#0A0F1E] font-semibold rounded-lg px-4 py-2.5 text-sm transition-all"
          >
            {evaluating ? 'Evaluating with AI...' : 'Submit for AI Evaluation'}
          </button>

          {/* Evaluation result */}
          {evaluation && (
            <div className="space-y-3 animate-fade-in">
              <div className={cn(
                'flex items-center justify-between p-3 rounded-lg border',
                evaluation.passed
                  ? 'bg-[#39FF1408] border-[#39FF1430]'
                  : 'bg-amber-500/5 border-amber-500/20'
              )}>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-lg font-bold font-mono',
                    evaluation.passed ? 'text-[#39FF14]' : 'text-amber-400'
                  )}>
                    {evaluation.score}%
                  </span>
                  <span className={cn(
                    'text-sm font-mono',
                    evaluation.passed ? 'text-[#39FF14]' : 'text-amber-400'
                  )}>
                    {evaluation.passed ? '✓ PASS' : '✗ NEEDS WORK'}
                  </span>
                </div>
              </div>

              <div className="bg-[#0A0F1E] border border-[#1E2D45] rounded-lg p-4">
                <div className="text-xs font-mono text-[#8892A4] uppercase mb-2">Feedback</div>
                <p className="text-sm text-white leading-relaxed">{evaluation.feedback}</p>
              </div>

              {evaluation.strengths.length > 0 && (
                <div className="bg-[#39FF1408] border border-[#39FF1420] rounded-lg p-4">
                  <div className="text-xs font-mono text-[#39FF14] uppercase mb-2">Strengths</div>
                  <ul className="space-y-1">
                    {evaluation.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-white flex gap-2"><span className="text-[#39FF14]">✓</span>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {evaluation.improvements.length > 0 && (
                <div className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-4">
                  <div className="text-xs font-mono text-amber-400 uppercase mb-2">Improve</div>
                  <ul className="space-y-1">
                    {evaluation.improvements.map((s, i) => (
                      <li key={i} className="text-sm text-white flex gap-2"><span className="text-amber-400">→</span>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {question.sample_answer && (
                <details className="bg-[#0A0F1E] border border-[#1E2D45] rounded-lg">
                  <summary className="px-4 py-3 text-xs font-mono text-[#8892A4] cursor-pointer hover:text-white">
                    View sample answer
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-sm text-[#8892A4] leading-relaxed">{question.sample_answer}</p>
                  </div>
                </details>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

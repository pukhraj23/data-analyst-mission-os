'use client'
// src/components/learn/LessonClient.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { SkillNode, UserSkillProgress } from '@/types'
import type { Lesson } from '@/lib/data/sql-lessons'
import { useAwardXP } from '@/lib/store'
import { cn, formatMinutes, getDifficultyLabel } from '@/lib/utils'
import {
  ArrowLeft, ArrowRight, BookOpen, Code2, Dumbbell, Flag,
  CheckCircle2, Eye, Lightbulb, Loader2, Zap, Clock
} from 'lucide-react'

interface Props {
  node: SkillNode
  progress: UserSkillProgress | null
  lesson: Lesson | null
}

const STEPS = [
  { id: 'learn', label: 'Learn', icon: BookOpen },
  { id: 'examples', label: 'Examples', icon: Code2 },
  { id: 'practice', label: 'Practice', icon: Dumbbell },
  { id: 'finish', label: 'Finish', icon: Flag },
] as const

export function LessonClient({ node, progress, lesson }: Props) {
  const router = useRouter()
  const awardXP = useAwardXP()

  const [step, setStep] = useState(0)
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [correct, setCorrect] = useState<Record<string, boolean>>({})
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [completing, setCompleting] = useState(false)
  const [done, setDone] = useState(
    progress?.status === 'completed' || progress?.status === 'mastered'
  )

  // Auto-mark in_progress when opening an available lesson
  useEffect(() => {
    if (progress?.status === 'available') {
      fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', skillNodeId: node.id }),
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const exercises = lesson?.exercises ?? []
  const correctCount = exercises.filter(ex => correct[ex.id]).length
  const masteryScore = lesson
    ? Math.round(50 + 50 * (exercises.length ? correctCount / exercises.length : 0.5))
    : 75

  async function completeLesson() {
    setCompleting(true)
    const res = await fetch('/api/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'complete', skillNodeId: node.id, masteryScore }),
    })
    if (res.ok) {
      await awardXP(node.xp_reward, 'skill_unlock', node.id, `Completed: ${node.name}`)
      setDone(true)
    }
    setCompleting(false)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => router.push('/skill-tree')}
            className="flex items-center gap-1.5 text-xs font-mono text-[#8892A4] hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3 h-3" /> Skill Tree
          </button>
          <h1 className="text-2xl font-bold text-white">{node.name}</h1>
          <p className="text-[#8892A4] text-sm mt-0.5">{node.description}</p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0 text-right">
          <div>
            <div className="text-sm font-bold font-mono text-[#F59E0B] flex items-center gap-1 justify-end">
              <Zap className="w-3.5 h-3.5" /> +{node.xp_reward}
            </div>
            <div className="text-[10px] text-[#8892A4] font-mono">XP</div>
          </div>
          <div>
            <div className="text-sm font-bold font-mono text-[#00D4FF] flex items-center gap-1 justify-end">
              <Clock className="w-3.5 h-3.5" /> {formatMinutes(node.estimated_minutes)}
            </div>
            <div className="text-[10px] text-[#8892A4] font-mono">{getDifficultyLabel(node.difficulty)}</div>
          </div>
        </div>
      </div>

      {/* Step nav */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const isActive = i === step
          const isPast = i < step
          return (
            <button
              key={s.id}
              onClick={() => setStep(i)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-mono transition-all border',
                isActive
                  ? 'bg-[#00D4FF15] text-[#00D4FF] border-[#00D4FF44]'
                  : isPast
                  ? 'text-[#39FF14] border-[#1E2D45] bg-[#39FF1408]'
                  : 'text-[#8892A4] border-[#1E2D45] hover:text-white'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {s.label}
            </button>
          )
        })}
      </div>

      {/* ---- STEP 0: LEARN ---- */}
      {step === 0 && (
        <div className="space-y-4">
          <div className="mission-card p-6">
            {lesson ? (
              <>
                <div className="space-y-4 mb-6">
                  {lesson.theory.split('\n\n').map((para, i) => (
                    <p key={i} className="text-sm text-white leading-relaxed">{para}</p>
                  ))}
                </div>
                <div className="bg-[#0A0F1E] border border-[#1E2D45] rounded-lg p-4">
                  <div className="text-xs font-mono text-[#00D4FF] uppercase tracking-wider mb-3">
                    Key Concepts
                  </div>
                  <ul className="space-y-2">
                    {lesson.key_concepts.map((c, i) => (
                      <li key={i} className="text-sm text-[#8892A4] flex gap-2.5 leading-relaxed">
                        <span className="text-[#00D4FF] flex-shrink-0">›</span>{c}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <SelfStudyMode node={node} />
            )}
          </div>
          <StepNav onNext={() => setStep(1)} />
        </div>
      )}

      {/* ---- STEP 1: EXAMPLES ---- */}
      {step === 1 && (
        <div className="space-y-4">
          {lesson && lesson.examples.length > 0 ? (
            lesson.examples.map((ex, i) => (
              <div key={i} className="mission-card p-5">
                <div className="text-sm font-semibold text-white mb-3">
                  <span className="text-[#00D4FF] font-mono mr-2">{String(i + 1).padStart(2, '0')}</span>
                  {ex.title}
                </div>
                <pre className="terminal-block overflow-x-auto whitespace-pre mb-3 text-xs leading-relaxed">
                  {ex.code}
                </pre>
                <p className="text-xs text-[#8892A4] leading-relaxed flex gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  {ex.explanation}
                </p>
              </div>
            ))
          ) : (
            <div className="mission-card p-6 text-center text-sm text-[#8892A4]">
              No worked examples for this node — apply the concepts directly in Practice.
            </div>
          )}
          <StepNav onBack={() => setStep(0)} onNext={() => setStep(2)} />
        </div>
      )}

      {/* ---- STEP 2: PRACTICE ---- */}
      {step === 2 && (
        <div className="space-y-4">
          {exercises.length > 0 ? (
            exercises.map((ex, i) => (
              <div key={ex.id} className="mission-card p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="text-sm text-white leading-relaxed">
                    <span className="text-[#00D4FF] font-mono mr-2">EX{i + 1}</span>
                    {ex.prompt}
                  </p>
                  {correct[ex.id] && <CheckCircle2 className="w-5 h-5 text-[#39FF14] flex-shrink-0" />}
                </div>

                <textarea
                  value={answers[ex.id] ?? ''}
                  onChange={e => setAnswers(prev => ({ ...prev, [ex.id]: e.target.value }))}
                  placeholder="-- Write your SQL here. Attempt it before revealing the solution."
                  rows={5}
                  className="w-full bg-[#080E1A] border border-[#1E2D45] rounded-lg px-4 py-3 text-xs text-[#00D4FF] placeholder-[#374151] focus:outline-none focus:border-[#00D4FF44] resize-y font-mono leading-relaxed mb-3"
                />

                <div className="flex items-center gap-2 flex-wrap">
                  {ex.hint && !revealed[ex.id] && (
                    <details className="inline-block">
                      <summary className="text-xs font-mono text-amber-400 cursor-pointer hover:text-amber-300 list-none">
                        💡 Hint
                      </summary>
                      <span className="text-xs text-[#8892A4] ml-2">{ex.hint}</span>
                    </details>
                  )}
                  <button
                    onClick={() => setRevealed(prev => ({ ...prev, [ex.id]: !prev[ex.id] }))}
                    className="flex items-center gap-1.5 text-xs font-mono text-[#8892A4] hover:text-white border border-[#1E2D45] hover:border-[#2A3F5A] rounded-lg px-3 py-1.5 transition-all ml-auto"
                  >
                    <Eye className="w-3 h-3" />
                    {revealed[ex.id] ? 'Hide' : 'Reveal'} Solution
                  </button>
                </div>

                {revealed[ex.id] && (
                  <div className="mt-3 animate-fade-in">
                    <pre className="terminal-block overflow-x-auto whitespace-pre text-xs leading-relaxed mb-3" style={{ color: '#39FF14' }}>
                      {ex.solution}
                    </pre>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#8892A4]">Did your answer match the logic?</span>
                      <button
                        onClick={() => setCorrect(prev => ({ ...prev, [ex.id]: true }))}
                        className={cn(
                          'text-xs font-mono px-3 py-1 rounded-lg border transition-all',
                          correct[ex.id]
                            ? 'bg-[#39FF1415] text-[#39FF14] border-[#39FF1444]'
                            : 'text-[#8892A4] border-[#1E2D45] hover:text-[#39FF14] hover:border-[#39FF1444]'
                        )}
                      >
                        ✓ Got it right
                      </button>
                      <button
                        onClick={() => setCorrect(prev => ({ ...prev, [ex.id]: false }))}
                        className={cn(
                          'text-xs font-mono px-3 py-1 rounded-lg border transition-all',
                          correct[ex.id] === false
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/40'
                            : 'text-[#8892A4] border-[#1E2D45] hover:text-amber-400'
                        )}
                      >
                        ✗ Need review
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="mission-card p-6 text-center text-sm text-[#8892A4]">
              Practice this skill hands-on, then mark the node complete in the next step.
            </div>
          )}
          <StepNav onBack={() => setStep(1)} onNext={() => setStep(3)} nextLabel="Finish Lesson" />
        </div>
      )}

      {/* ---- STEP 3: FINISH ---- */}
      {step === 3 && (
        <div className="mission-card p-8 text-center space-y-5">
          {done ? (
            <>
              <div className="text-5xl">✅</div>
              <div>
                <h2 className="text-xl font-bold text-[#39FF14] mb-1">Skill Complete</h2>
                <p className="text-sm text-[#8892A4]">
                  {node.name} is locked in. Newly unlocked skills are waiting on the tree.
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => router.push('/skill-tree')}
                  className="flex items-center gap-2 bg-[#39FF14] hover:bg-[#2ECC11] text-[#0A0F1E] font-semibold rounded-lg px-5 py-2.5 text-sm transition-all"
                  style={{ boxShadow: '0 0 16px rgba(57,255,20,0.4)' }}
                >
                  Back to Skill Tree <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-5 py-2.5 rounded-lg border border-[#1E2D45] text-[#8892A4] text-sm hover:text-white transition-all"
                >
                  Dashboard
                </button>
              </div>
            </>
          ) : (
            <>
              <Flag className="w-10 h-10 text-[#00D4FF] mx-auto" />
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Complete {node.name}</h2>
                {lesson && (
                  <p className="text-sm text-[#8892A4] mb-1">{lesson.summary}</p>
                )}
                {exercises.length > 0 && (
                  <p className="text-xs font-mono text-[#8892A4] mt-2">
                    Exercises correct: <span className="text-[#39FF14]">{correctCount}/{exercises.length}</span>
                    {' · '}Mastery: <span className={masteryScore >= 85 ? 'text-[#39FF14]' : 'text-[#00D4FF]'}>{masteryScore}%</span>
                    {masteryScore >= 85 && ' (Mastered)'}
                  </p>
                )}
              </div>
              <button
                onClick={completeLesson}
                disabled={completing}
                className="inline-flex items-center gap-2 bg-[#00D4FF] hover:bg-[#00B8E0] text-[#0A0F1E] font-semibold rounded-lg px-6 py-2.5 text-sm transition-all disabled:opacity-60"
                style={{ boxShadow: '0 0 16px rgba(0,212,255,0.4)' }}
              >
                {completing
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <CheckCircle2 className="w-4 h-4" />}
                Mark Complete · +{node.xp_reward} XP
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function StepNav({ onBack, onNext, nextLabel = 'Continue' }: {
  onBack?: () => void
  onNext: () => void
  nextLabel?: string
}) {
  return (
    <div className="flex justify-between">
      {onBack ? (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-[#8892A4] hover:text-white border border-[#1E2D45] rounded-lg px-4 py-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      ) : <span />}
      <button
        onClick={onNext}
        className="flex items-center gap-1.5 bg-[#00D4FF15] hover:bg-[#00D4FF25] text-[#00D4FF] border border-[#00D4FF44] font-medium rounded-lg px-4 py-2 text-sm transition-all"
      >
        {nextLabel} <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}

function SelfStudyMode({ node }: { node: SkillNode }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-white leading-relaxed">
        Structured lesson content for this node ships in a later content drop. For V1, run the
        self-study loop below — it covers the same Learn → Practice → Verify cycle.
      </p>
      <div className="bg-[#0A0F1E] border border-[#1E2D45] rounded-lg p-4">
        <div className="text-xs font-mono text-[#00D4FF] uppercase tracking-wider mb-3">
          Self-Study Checklist
        </div>
        <ul className="space-y-2 text-sm text-[#8892A4]">
          <li className="flex gap-2.5"><span className="text-[#00D4FF]">1.</span>Ask the AI Coach: "Teach me {node.name} for a Data Analyst role"</li>
          <li className="flex gap-2.5"><span className="text-[#00D4FF]">2.</span>Work 3 practice problems without looking at references</li>
          <li className="flex gap-2.5"><span className="text-[#00D4FF]">3.</span>Explain the concept out loud as if answering an interviewer</li>
          <li className="flex gap-2.5"><span className="text-[#00D4FF]">4.</span>Mark complete in the Finish step</li>
        </ul>
      </div>
    </div>
  )
}

// src/lib/engines/coach-engine.ts
// AI Coach powered by Claude — context-aware coaching for every task

import Anthropic from '@anthropic-ai/sdk'
import type { Profile, SkillNode, Mission, CoachMessage } from '@/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// System prompt for the AI Coach
function buildCoachSystemPrompt(
  profile: Profile,
  context: {
    currentSkill?: SkillNode
    currentMission?: Mission
    sessionType: string
  }
): string {
  return `You are the AI Coach for DATA ANALYST MISSION OS — a career-focused learning platform. Your ONLY goal is to help ${profile.full_name ?? 'the user'} get a Data Analyst internship and full-time job as fast as possible.

## User Context
- Current Level: ${profile.current_level} (${getLevelTitle(profile.current_level)})
- Internship Readiness: ${profile.internship_readiness_score}%
- Current Streak: ${profile.current_streak} days
- Sprint Mode: ${profile.sprint_mode_enabled ? 'ON' : 'OFF'}
${context.currentSkill ? `- Currently Studying: ${context.currentSkill.name} (${context.currentSkill.domain_id})` : ''}
${context.currentMission ? `- Current Mission: ${context.currentMission.title}` : ''}

## Your Coaching Mandate
1. Be direct and specific — no fluff, no motivation speeches
2. Always connect your advice to internship/job outcomes
3. Teach the person to think, not just copy answers
4. Point out patterns that appear in real interviews
5. Flag common mistakes hiring managers hate
6. Never give complete solutions — give guidance that builds understanding
7. Maximize AI leverage: tell users when to use AI tools and when to do it themselves

## Session Type: ${context.sessionType}
${getSessionTypeInstructions(context.sessionType)}

## Response Style
- Short and actionable (3-5 sentences unless explaining a concept)
- Use code examples when relevant — formatted in markdown
- Use 🎯 for career-critical insights
- Use ⚠️ for common mistakes
- Use 💡 for AI leverage tips
- Use ✅ for correct approaches

Keep responses focused on what matters: getting the job.`
}

function getLevelTitle(level: number): string {
  const titles = ['', 'Beginner', 'SQL Apprentice', 'Data Explorer', 'Business Analyst', 'Data Analyst', 'Internship Ready', 'Job Ready']
  return titles[level] ?? 'Unknown'
}

function getSessionTypeInstructions(sessionType: string): string {
  const instructions: Record<string, string> = {
    lesson: 'Help the user understand the concept deeply enough to explain it in an interview. Ask Socratic questions to check understanding.',
    exercise: 'Guide without giving answers. If they are stuck, give a hint that points them in the right direction. Praise good problem-solving approaches.',
    interview: 'Conduct realistic mock interview questions. Score their answers and give specific, actionable feedback. Be honest about gaps.',
    project: 'Review their work like a senior analyst. Focus on business impact clarity, code quality, and portfolio presentation.',
    career: 'Provide career strategy advice. Focus on highest ROI actions for internship/job acquisition. Be direct about market realities.',
    general: 'Answer questions, explain concepts, and guide their learning path. Always connect answers to career outcomes.',
  }
  return instructions[sessionType] ?? instructions.general
}

// Main chat function
export async function sendCoachMessage(
  messages: CoachMessage[],
  newMessage: string,
  profile: Profile,
  context: {
    currentSkill?: SkillNode
    currentMission?: Mission
    sessionType: string
  }
): Promise<string> {
  const systemPrompt = buildCoachSystemPrompt(profile, context)

  // Convert our messages format to Anthropic format
  const anthropicMessages = [
    ...messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: newMessage },
  ]

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: anthropicMessages,
  })

  const textContent = response.content.find(c => c.type === 'text')
  return textContent?.text ?? 'I apologize, I could not generate a response. Please try again.'
}

// Interview evaluator
export async function evaluateInterviewAnswer(
  question: string,
  userAnswer: string,
  sampleAnswer: string,
  keyPoints: string[],
  category: string
): Promise<{
  score: number
  feedback: string
  strengths: string[]
  improvements: string[]
  passed: boolean
}> {
  const prompt = `You are a senior Data Analyst interviewer evaluating a candidate's answer.

**Question**: ${question}

**Category**: ${category}

**Candidate's Answer**: ${userAnswer}

**Key Points That Should Be Covered**: ${keyPoints.join(', ')}

**Reference Answer**: ${sampleAnswer}

Evaluate the answer and respond with ONLY valid JSON in this exact format:
{
  "score": <integer 0-100>,
  "passed": <boolean, true if score >= 65>,
  "feedback": "<2-3 sentences of direct, honest feedback>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<specific improvement 1>", "<specific improvement 2>"]
}

Be a fair but honest interviewer. Score accurately — do not inflate scores.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content.find(c => c.type === 'text')?.text ?? '{}'

  try {
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
    return {
      score: parsed.score ?? 50,
      feedback: parsed.feedback ?? 'Could not evaluate answer.',
      strengths: parsed.strengths ?? [],
      improvements: parsed.improvements ?? [],
      passed: parsed.passed ?? parsed.score >= 65,
    }
  } catch {
    return {
      score: 50,
      feedback: 'Answer evaluated. Please review the sample answer for comparison.',
      strengths: [],
      improvements: ['Provide more specific details', 'Use the STAR method for structured answers'],
      passed: false,
    }
  }
}

// Career GPS — highest ROI action recommendation
export async function getCareerGPSRecommendation(
  profile: Profile,
  readinessBreakdown: {
    overall: number
    gaps: Array<{ skill: string; currentScore: number; requiredScore: number; priority: string }>
    topROIAction: string
  }
): Promise<string> {
  const prompt = `You are a Data Analyst career coach. Based on this profile, give ONE specific, actionable recommendation.

**Internship Readiness**: ${readinessBreakdown.overall}%
**Current Level**: ${getLevelTitle(profile.current_level)}
**Streak**: ${profile.current_streak} days
**Sprint Mode**: ${profile.sprint_mode_enabled ? 'ON' : 'OFF'}
**Top Gaps**: ${readinessBreakdown.gaps.slice(0, 3).map(g => `${g.skill} (${g.currentScore}% → ${g.requiredScore}% needed)`).join(', ')}

Give 2-3 sentences maximum. Be specific about WHAT to do TODAY. Focus only on what will move the internship readiness score.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }],
  })

  return response.content.find(c => c.type === 'text')?.text ?? readinessBreakdown.topROIAction
}

// AI leverage guide generator
export async function generateAILeverageGuide(
  skillName: string,
  domainId: string
): Promise<{
  do_yourself: string[]
  use_claude: string[]
  use_chatgpt: string[]
  never_delegate: string[]
  top_performer_workflow: string
}> {
  const prompt = `You are an expert on AI-augmented Data Analyst workflows. For the skill "${skillName}" (domain: ${domainId}), provide a practical AI leverage guide.

Respond with ONLY valid JSON:
{
  "do_yourself": ["<task 1>", "<task 2>", "<task 3>"],
  "use_claude": ["<use case 1>", "<use case 2>"],
  "use_chatgpt": ["<use case 1>", "<use case 2>"],
  "never_delegate": ["<task 1>", "<task 2>"],
  "top_performer_workflow": "<1-2 sentences describing how top analysts use AI for this skill>"
}

Focus on what actually matters for passing interviews and doing real work. Be specific.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content.find(c => c.type === 'text')?.text ?? '{}'

  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return {
      do_yourself: ['Write all queries from scratch', 'Interpret business results', 'Make analytical decisions'],
      use_claude: ['Debug complex queries', 'Explain unfamiliar functions', 'Review your approach'],
      use_chatgpt: ['Generate template structures', 'Check documentation', 'Brainstorm approaches'],
      never_delegate: ['Interview answers', 'Final business recommendations', 'Your portfolio narrative'],
      top_performer_workflow: 'Top analysts use AI to move 3x faster while maintaining full ownership of the analytical judgment.',
    }
  }
}

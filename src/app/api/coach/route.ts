// src/app/api/coach/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/route'
import { sendCoachMessage, evaluateInterviewAnswer, getCareerGPSRecommendation } from '@/lib/engines/coach-engine'
import type { Profile, SkillNode, Mission, CoachMessage } from '@/types'

export async function POST(request: NextRequest) {
  const supabase = createRouteClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { action } = body

  if (action === 'chat') {
    const { message, conversationId, sessionType, contextSkillId, contextMissionId } = body

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    // Fetch conversation history
    let conversation
    if (conversationId) {
      const { data } = await supabase
        .from('coach_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single()
      conversation = data
    }

    const messages: CoachMessage[] = (conversation?.messages as CoachMessage[]) ?? []

    // Fetch context
    let currentSkill: SkillNode | undefined
    let currentMission: Mission | undefined

    if (contextSkillId) {
      const { data } = await supabase.from('skill_nodes').select('*').eq('id', contextSkillId).single()
      currentSkill = data ?? undefined
    }

    if (contextMissionId) {
      const { data } = await supabase.from('missions').select('*').eq('id', contextMissionId).single()
      currentMission = data ?? undefined
    }

    // Get AI response
    try {
      const response = await sendCoachMessage(
        messages,
        message,
        profile as Profile,
        { currentSkill, currentMission, sessionType: sessionType ?? 'general' }
      )

      // Update conversation
      const newMessages: CoachMessage[] = [
        ...messages,
        { role: 'user', content: message, timestamp: new Date().toISOString() },
        { role: 'assistant', content: response, timestamp: new Date().toISOString() },
      ]

      if (conversationId) {
        await supabase
          .from('coach_conversations')
          .update({ messages: newMessages })
          .eq('id', conversationId)
      } else {
        const { data: newConvo } = await supabase
          .from('coach_conversations')
          .insert({
            user_id: user.id,
            session_type: sessionType ?? 'general',
            context_skill_id: contextSkillId ?? null,
            context_mission_id: contextMissionId ?? null,
            messages: newMessages,
          })
          .select()
          .single()

        return NextResponse.json({
          data: { response, conversationId: newConvo?.id },
          success: true
        })
      }

      return NextResponse.json({ data: { response, conversationId }, success: true })
    } catch (error) {
      console.error('Coach API error:', error)
      return NextResponse.json({ error: 'AI coach temporarily unavailable' }, { status: 500 })
    }
  }

  if (action === 'evaluate_answer') {
    const { question, userAnswer, sampleAnswer, keyPoints, category, questionId } = body

    try {
      const evaluation = await evaluateInterviewAnswer(
        question,
        userAnswer,
        sampleAnswer ?? '',
        keyPoints ?? [],
        category ?? 'general'
      )

      // Store the attempt
      if (questionId) {
        await supabase.from('user_interview_attempts').insert({
          user_id: user.id,
          question_id: questionId,
          user_answer: userAnswer,
          ai_feedback: evaluation.feedback,
          score: evaluation.score,
          confidence_level: body.confidenceLevel ?? 3,
        })
      }

      return NextResponse.json({ data: evaluation, success: true })
    } catch (error) {
      console.error('Evaluation error:', error)
      return NextResponse.json({ error: 'Evaluation failed' }, { status: 500 })
    }
  }

  if (action === 'career_gps') {
    const { readinessBreakdown } = body

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    try {
      const recommendation = await getCareerGPSRecommendation(profile as Profile, readinessBreakdown)
      return NextResponse.json({ data: { recommendation }, success: true })
    } catch (error) {
      return NextResponse.json({ data: { recommendation: readinessBreakdown.topROIAction }, success: true })
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

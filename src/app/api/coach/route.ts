import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/route'

export async function POST(request: NextRequest) {
  const supabase = createRouteClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { action } = body

  if (action === 'chat') {
    const { message } = body
    return NextResponse.json({
      data: {
        response: `Great question! For personalised coaching, use Claude directly at claude.ai — your subscription is already active there. Ask: "${message}"`,
        conversationId: null
      },
      success: true
    })
  }

  if (action === 'evaluate_answer') {
    return NextResponse.json({
      data: {
        score: 70,
        feedback: 'Answer recorded. For detailed AI feedback, paste your answer to Claude at claude.ai',
        strengths: ['Answer submitted'],
        improvements: ['Use claude.ai for detailed evaluation'],
        passed: true
      },
      success: true
    })
  }

  if (action === 'career_gps') {
    return NextResponse.json({
      data: { recommendation: 'Focus on SQL first — it appears in 95% of DA interviews.' },
      success: true
    })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
// src/app/api/skills/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/route'

export async function GET(request: NextRequest) {
  const supabase = createRouteClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const domain = searchParams.get('domain')
  const nodeId = searchParams.get('nodeId')

  if (nodeId) {
    const [nodeResult, progressResult] = await Promise.all([
      supabase.from('skill_nodes').select('*, skill_domains(*)').eq('id', nodeId).single(),
      supabase.from('user_skill_progress').select('*').eq('user_id', user.id).eq('skill_node_id', nodeId).single(),
    ])

    return NextResponse.json({
      data: {
        node: nodeResult.data,
        progress: progressResult.data,
      },
      success: true
    })
  }

  // Fetch all domains with nodes and user progress
  const [domainsResult, nodesResult, progressResult] = await Promise.all([
    supabase.from('skill_domains').select('*').order('sort_order'),
    domain
      ? supabase.from('skill_nodes').select('*').eq('domain_id', domain).order('sort_order')
      : supabase.from('skill_nodes').select('*').order('sort_order'),
    supabase.from('user_skill_progress').select('*').eq('user_id', user.id),
  ])

  const nodes = nodesResult.data ?? []
  const progress = progressResult.data ?? []

  // Merge progress into nodes
  const nodesWithProgress = nodes.map(node => ({
    ...node,
    progress: progress.find(p => p.skill_node_id === node.id) ?? null,
  }))

  return NextResponse.json({
    data: {
      domains: domainsResult.data,
      nodes: nodesWithProgress,
    },
    success: true
  })
}

export async function POST(request: NextRequest) {
  const supabase = createRouteClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { action, skillNodeId } = body

  if (action === 'start') {
    const { error } = await supabase
      .from('user_skill_progress')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString(),
        last_attempted_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('skill_node_id', skillNodeId)
      .eq('status', 'available')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (action === 'complete') {
    const { masteryScore } = body

    const status = masteryScore >= 85 ? 'mastered' : 'completed'

    const { error } = await supabase
      .from('user_skill_progress')
      .update({
        status,
        mastery_score: masteryScore ?? 75,
        completed_at: new Date().toISOString(),
        last_attempted_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('skill_node_id', skillNodeId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Unlock next skills
    const [progressResult, nodesResult] = await Promise.all([
      supabase.from('user_skill_progress').select('*').eq('user_id', user.id),
      supabase.from('skill_nodes').select('id, prerequisites').neq('id', skillNodeId),
    ])

    const allProgress = progressResult.data ?? []
    const allNodes = nodesResult.data ?? []

    const completedIds = new Set(
      allProgress
        .filter(p => p.status === 'completed' || p.status === 'mastered')
        .map(p => p.skill_node_id)
    )
    completedIds.add(skillNodeId)

    const toUnlock = allNodes.filter(node => {
      const current = allProgress.find(p => p.skill_node_id === node.id)
      if (current?.status !== 'locked') return false
      return (node.prerequisites as string[]).every(prereq => completedIds.has(prereq))
    })

    if (toUnlock.length > 0) {
      await Promise.all(
        toUnlock.map(n =>
          supabase
            .from('user_skill_progress')
            .update({ status: 'available' })
            .eq('user_id', user.id)
            .eq('skill_node_id', n.id)
        )
      )
    }

    return NextResponse.json({
      data: { status, unlockedSkills: toUnlock.map(n => n.id) },
      success: true
    })
  }

  if (action === 'initialize') {
    // Initialize all skills for a new user
    const { data: allNodes } = await supabase.from('skill_nodes').select('id, prerequisites')

    if (!allNodes) return NextResponse.json({ error: 'No skill nodes found' }, { status: 500 })

    const inserts = allNodes.map(node => ({
      user_id: user.id,
      skill_node_id: node.id,
      status: (node.prerequisites as string[]).length === 0 ? 'available' : 'locked',
    }))

    const { error } = await supabase
      .from('user_skill_progress')
      .upsert(inserts, { onConflict: 'user_id,skill_node_id', ignoreDuplicates: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, data: { initialized: inserts.length } })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

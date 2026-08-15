import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { teacherId, action } = await request.json();

    if (!teacherId || !action) {
      return NextResponse.json({ error: 'Missing teacherId or action' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    if (action === 'clock_in') {
      const { data, error } = await supabaseAdmin
        .from('teacher_attendance')
        .upsert(
          {
            teacher_id: teacherId,
            date: today,
            clock_in: now.toISOString(),
            status: 'present',
          },
          { onConflict: 'teacher_id,date' }
        )
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, record: data });
    } else if (action === 'clock_out') {
      const { data, error } = await supabaseAdmin
        .from('teacher_attendance')
        .update({
          clock_out: now.toISOString(),
        })
        .eq('teacher_id', teacherId)
        .eq('date', today)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, record: data });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
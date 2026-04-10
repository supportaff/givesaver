import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('ngo_registrations')
      .insert([{
        org_name:         body.orgName,
        reg_number:       body.regNumber,
        year_established: Number(body.yearEstablished),
        focus_area:       body.focusArea,
        operating_area:   body.operatingArea,
        address:          body.address,
        website:          body.website || null,
        receiver_name:    body.receiverName,
        designation:      body.designation,
        whatsapp:         body.whatsapp,
        alternate_phone:  body.alternatePhone || null,
        email:            body.email,
        id_type:          body.idType,
        id_number:        body.idNumber,
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch (err) {
    console.error('POST /api/ngo-register error:', err);
    return NextResponse.json({ error: 'Failed to submit registration' }, { status: 500 });
  }
}

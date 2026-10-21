import { put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}
function clean(value, max) {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max)
    : '';
}
export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || !['feedback', 'chat'].includes(body.type) || typeof body.id !== 'string') {
      return json({ error: '신고 요청을 확인해 주세요.' }, 400);
    }
    const reason = clean(body.reason, 300);
    if (reason.length < 2) return json({ error: '신고 이유를 적어 주세요.' }, 400);
    const report = {
      id: randomUUID(),
      messageId: body.id.slice(0, 100),
      type: body.type,
      reason,
      createdAt: new Date().toISOString()
    };
    await put(`community/reports/${report.createdAt.replace(/[:.]/g, '-')}-${report.id}.json`, JSON.stringify(report), {
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: false
    });
    return json({ ok: true }, 201);
  } catch (error) {
    console.error('POST /api/report failed:', error);
    return json({ error: '신고를 저장하지 못했어요.' }, 500);
  }
}

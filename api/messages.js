import { put, list, get } from '@vercel/blob';
import { randomUUID } from 'node:crypto';

const MAX_FEEDBACK = 120;
const MAX_CHAT = 100;
const WINDOW_MS = 60000; 
const MAX_POSTS_PER_WINDOW = 8;
const recentPosts = new Map();

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}
function cleanText(value, max) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
}

const BLOCKED_PATTERNS = [
  /시\s*발/, /씨\s*발/, /병\s*신/, /ㅅ\s*ㅂ/, /개\s*새\s*끼/,
  /죽어/, /꺼져/, /좆/, /보\s*지/, /섹\s*스/, /자\s*살/
];

function looksInappropriate(text) {
  return BLOCKED_PATTERNS.some(pattern => pattern.test(text));
}
function checkRateLimit(request) {
  const key = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const recent = (recentPosts.get(key) || []).filter(time => now - time < WINDOW_MS);
  if (recent.length >= MAX_POSTS_PER_WINDOW) return false;
  recent.push(now);
  recentPosts.set(key, recent);
  if (recentPosts.size > 2000) {
    for (const [ip, times] of recentPosts) if (!times.some(time => now - time < WINDOW_MS)) recentPosts.delete(ip);
  }
  return true;
}

async function getMessages(type, limit) {
  try {
    const prefix = `community/${type}/`;
    
    const result = await list({ prefix, limit: 1000 });
    
    const blobs = result.blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)).slice(0, limit);
    const messages = await Promise.all(blobs.map(async blob => {
      try {
        // private 스토어는 인증이 필요하므로 일반 fetch 대신 SDK의 get()으로 읽습니다.
        const result = await get(blob.pathname, { access: 'private', useCache: false });
        if (!result || result.statusCode !== 200 || !result.stream) return null;
        const item = await new Response(result.stream).json();
        return {
          id: String(item.id || ''),
          type,
          name: cleanText(item.name, 24),
          message: cleanText(item.message, type === 'chat' ? 300 : 1200),
          createdAt: item.createdAt || blob.uploadedAt
        };
      } catch { return null; }
    }));
    return messages.filter(item => item && item.name && item.message)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } catch (err) {
    console.error('List Error:', err);
    throw err;
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    if (!['feedback', 'chat'].includes(type)) return json({ error: '지원하지 않는 메시지 종류입니다.' }, 400);
    const messages = await getMessages(type, type === 'chat' ? MAX_CHAT : MAX_FEEDBACK);
    return json({ messages });
  } catch (error) {
    console.error('GET /api/messages failed:', error);
    return json({ error: '저장 실패: ' + (error?.message || String(error)) }, 500);
  }
}

export async function POST(request) {
  try {
    if (!checkRateLimit(request)) return json({ error: '메시지를 너무 자주 보냈어요. 잠시 후 다시 시도해 주세요.' }, 429);
    const body = await request.json().catch(() => null);
    if (!body || !['feedback', 'chat'].includes(body.type)) return json({ error: '잘못된 요청입니다.' }, 400);
    const type = body.type;
    const name = cleanText(body.name, 24);
    const message = cleanText(body.message, type === 'chat' ? 300 : 1200);
    if (name.length < 1 || message.length < 1) return json({ error: '닉네임과 메시지를 입력해 주세요.' }, 400);
    if (looksInappropriate(name) || looksInappropriate(message)) {
      return json({ error: '친구들이 함께 보는 공간이에요. 다른 사람을 불편하게 하는 말은 등록할 수 없어요.' }, 400);
    }
    if (/https?:\/\//i.test(message) || /www\./i.test(message)) {
      return json({ error: '게시판과 채팅에는 링크를 올릴 수 없어요.' }, 400);
    }
    
    const item = { id: randomUUID(), type, name, message, createdAt: new Date().toISOString() };
    const blobPath = `community/${type}/${Date.now()}-${item.id}.json`;
    
    await put(blobPath, JSON.stringify(item), {
      access: 'private', 
      contentType: 'application/json',
      addRandomSuffix: true
    });
    
    return json({ ok: true, message: { id: item.id, type, name, message, createdAt: item.createdAt } }, 201);
  } catch (error) {
    console.error('POST /api/messages failed:', error);
<<<<<<< HEAD
    return json({ error: '메시지를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.' }, 500);
=======
    return json({ error: '저장 실패: ' + (error?.message || String(error)) }, 500);
>>>>>>> 3cb6ac9be6c6a8d3c89e9687d3afc9cfb0bd5f69
  }
}

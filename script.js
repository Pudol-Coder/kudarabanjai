const $ = (selector) => document.querySelector(selector);
const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const safeDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '방금 전' : date.toLocaleString('ko-KR', {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
};

$('#year').textContent = new Date().getFullYear();
$('#menuToggle').addEventListener('click', () => {
  const nav = $('#mainNav');
  const open = nav.classList.toggle('open');
  $('#menuToggle').setAttribute('aria-expanded', String(open));
});
$('#mainNav').querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  $('#mainNav').classList.remove('open');
  $('#menuToggle').setAttribute('aria-expanded', 'false');
}));

$('#feedbackText').addEventListener('input', e => $('#feedbackCount').textContent = `${e.target.value.length} / 1200`);

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {'Content-Type':'application/json', ...(options.headers || {})}
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || '요청을 처리하지 못했어요.');
  return data;
}

function renderFeedback(items) {
  const root = $('#feedbackList');
  if (!items.length) {
    root.innerHTML = '<p class="empty-state">아직 의견이 없어요. 첫 의견을 남겨 주세요!</p>';
    return;
  }
  root.innerHTML = items.map(item => `<article class="message-item"><div class="message-item-top"><strong>${escapeHTML(item.name)}</strong><span><time>${escapeHTML(safeDate(item.createdAt))}</time> <button class="report-button" type="button" data-report-type="feedback" data-report-id="${escapeHTML(item.id)}">신고</button></span></div><p>${escapeHTML(item.message)}</p></article>`).join('');
}
function renderChat(items) {
  const root = $('#chatList');
  const wasNearBottom = root.scrollHeight - root.scrollTop - root.clientHeight < 60;
  if (!items.length) {
    root.innerHTML = '<p class="empty-state">아직 채팅이 없어요. 첫 메시지를 보내 보세요!</p>';
    return;
  }
  const myName = $('#chatName').value.trim();
  root.innerHTML = items.map(item => {
    const mine = myName && item.name === myName;
    return `<article class="chat-bubble ${mine ? 'mine' : ''}"><div class="chat-meta"><strong>${escapeHTML(item.name)}</strong><time>${escapeHTML(safeDate(item.createdAt))}</time><button class="report-button" type="button" data-report-type="chat" data-report-id="${escapeHTML(item.id)}" aria-label="메시지 신고">신고</button></div><div class="chat-content">${escapeHTML(item.message)}</div></article>`;
  }).join('');
  if (wasNearBottom) root.scrollTop = root.scrollHeight;
}

async function loadFeedback() {
  try {
    const data = await api('/api/messages?type=feedback');
    renderFeedback(data.messages || []);
  } catch (error) {
    $('#feedbackList').innerHTML = `<p class="empty-state">${escapeHTML(error.message)}<br>배포 후 Vercel Blob 설정을 확인해 주세요.</p>`;
  }
}
async function loadChat() {
  try {
    const data = await api('/api/messages?type=chat');
    renderChat(data.messages || []);
  } catch (error) {
    $('#chatList').innerHTML = `<p class="empty-state">${escapeHTML(error.message)}<br>잠시 후 다시 시도해 주세요.</p>`;
  }
}

$('#feedbackForm').addEventListener('submit', async event => {
  event.preventDefault();
  const button = event.submitter;
  const status = $('#feedbackStatus');
  const name = $('#feedbackName').value.trim();
  const message = $('#feedbackText').value.trim();
  if (!name || !message) return;
  button.disabled = true;
  status.textContent = '등록 중…';
  try {
    await api('/api/messages', {method:'POST', body:JSON.stringify({type:'feedback', name, message})});
    $('#feedbackText').value = '';
    $('#feedbackCount').textContent = '0 / 1200';
    status.textContent = '의견을 등록했어요. 고마워요!';
    await loadFeedback();
  } catch (error) {
    status.textContent = error.message;
  } finally { button.disabled = false; }
});

$('#chatForm').addEventListener('submit', async event => {
  event.preventDefault();
  const button = event.submitter;
  const name = $('#chatName').value.trim();
  const message = $('#chatText').value.trim();
  if (!name || !message) return;
  button.disabled = true;
  try {
    await api('/api/messages', {method:'POST', body:JSON.stringify({type:'chat', name, message})});
    $('#chatText').value = '';
    await loadChat();
  } catch (error) {
    alert(error.message);
  } finally { button.disabled = false; }
});
$('#refreshFeedback').addEventListener('click', loadFeedback);


document.addEventListener('click', async event => {
  const button = event.target.closest('[data-report-id]');
  if (!button) return;
  const reason = prompt('어떤 점이 부적절한가요? 신고 이유를 적어 주세요.');
  if (!reason || !reason.trim()) return;
  button.disabled = true;
  try {
    await api('/api/report', {method:'POST', body:JSON.stringify({
      type: button.dataset.reportType, id: button.dataset.reportId, reason: reason.trim()
    })});
    alert('신고가 접수됐어요. 운영자가 확인할 수 있도록 저장했습니다.');
  } catch (error) {
    alert(error.message);
  } finally { button.disabled = false; }
});

// Static content is deliberately managed as JSON so adding games/devlogs doesn't require editing HTML.
async function loadContent() {
  try {
    const [devlogsResponse, gamesResponse] = await Promise.all([
      fetch('/content/devlogs.json'), fetch('/content/games.json')
    ]);
    if (devlogsResponse.ok) {
      const data = await devlogsResponse.json();
      if (Array.isArray(data) && data.length) {
        $('#devlogList').innerHTML = data.map(item => `<article class="devlog-card"><div class="card-topline"><span class="tag">${escapeHTML(item.tag || 'DEVLOG')}</span><span>${escapeHTML(item.date || '')}</span></div><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.description)}</p>${item.url ? `<div class="card-footer"><a href="${escapeHTML(item.url)}" target="_blank" rel="noopener noreferrer">자세히 보기 ↗</a><span>↗</span></div>` : ''}</article>`).join('');
      }
    }
    if (gamesResponse.ok) {
      const games = await gamesResponse.json();
      if (Array.isArray(games) && games.length) {
        $('#gamesList').innerHTML = games.map(game => {
          const path = String(game.file || '');
          const validLocal = path.startsWith('/games/') && !path.includes('..') && !path.includes('\\');
          return `<article class="game-card"><div class="game-cover"><div class="cover-symbol">${escapeHTML(game.symbol || '✳')}</div><span class="cover-label">${escapeHTML(game.label || 'INDIE GAME')}</span></div><div class="game-info"><div class="game-title-row"><h3>${escapeHTML(game.title)}</h3><span class="tag tag-light">${escapeHTML(game.version || '최신')}</span></div><p>${escapeHTML(game.description || '')}</p>${validLocal ? `<a class="button button-primary" href="${escapeHTML(path)}" download>게임 다운로드 <span>↓</span></a>` : '<button class="button button-disabled" disabled>파일 경로 확인 필요</button>'}</div></article>`;
        }).join('');
      }
    }
  } catch (error) {
    console.warn('사이트 콘텐츠를 불러오지 못했습니다.', error);
  }
}

loadContent();
loadFeedback();
loadChat();
// Blob-backed chat is refreshed by polling. This is near-real-time, not a persistent WebSocket connection.
setInterval(loadChat, 4000);
setInterval(loadFeedback, 20000);

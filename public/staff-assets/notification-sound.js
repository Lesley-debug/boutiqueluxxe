/* Boutique Luxxe: opt-in, foreground-only notification chime. No external services. */
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root.document) api.mount(root);
})(globalThis, function () {
    'use strict';
    function accept(state, data) {
        if (!data || !Array.isArray(data.items) || data.items.length > 100 || typeof data.cursor !== 'string' || typeof data.user !== 'string') throw new Error('Invalid sound feed');
        if (data.user !== state.user) throw new Error('Account changed');
        const first = !state.cursor || data.baseline === true || data.overflow === true;
        let alert = false;
        for (const item of data.items) {
            if (!item || typeof item.id !== 'string' || typeof item.unread !== 'boolean') throw new Error('Invalid sound item');
            if (!first && item.unread && !state.seen.has(item.id)) alert = true;
        }
        for (const item of data.items) state.seen.add(item.id);
        while (state.seen.size > 512) state.seen.delete(state.seen.values().next().value);
        state.cursor = data.cursor;
        return alert;
    }
    function tone(context) {
        if (!context || context.state !== 'running') return false;
        [880, 1174.66].forEach((frequency, index) => {
            const start = context.currentTime + index * 0.14;
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(frequency, start);
            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.linearRampToValueAtTime(0.035, start + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
            oscillator.connect(gain); gain.connect(context.destination);
            oscillator.start(start); oscillator.stop(start + 0.2);
            oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
        });
        return true;
    }
    function mount(win) {
        const doc = win.document, element = doc.querySelector('[data-staff-notification-sound]');
        if (!element) return null;
        if (win.__luxxeStaffSound) win.__luxxeStaffSound.destroy();
        const user = element.dataset.user, endpoint = new URL(element.dataset.endpoint, win.location.href);
        const summary = element.querySelector('[data-sound-summary]'), status = element.querySelector('[data-sound-status]');
        const enable = element.querySelector('[data-sound-enable]'), test = element.querySelector('[data-sound-test]'), mute = element.querySelector('[data-sound-mute]');
        const Audio = win.AudioContext || win.webkitAudioContext;
        const supported = /^\d+$/.test(user) && endpoint.origin === win.location.origin && win.navigator.locks && Audio;
        const key = 'boutique-luxxe:staff-sound:v1:' + user, lockName = 'boutique-luxxe-staff-sound-' + user;
        let enabled = false, context = null, leader = false, acquiring = false, release = null;
        let interval = null, pending = null, destroyed = false, blocked = false, cooldown = 0, lastSuccess = 0;
        let state = { user, cursor: null, seen: new Set() };
        try { enabled = win.localStorage.getItem(key) === 'on'; } catch (_) { /* In-memory consent still works. */ }
        function text(node, value) { if (node.textContent !== value) node.textContent = value; }
        function display(message) {
            text(summary, !enabled ? 'Sound off' : context && context.state === 'running' ? 'Sound on' : 'Tap for sound');
            if (message) text(status, message);
            enable.disabled = test.disabled = !supported || blocked;
            mute.disabled = !enabled;
        }
        function eligible() { return supported && !destroyed && !blocked && enabled && context && context.state === 'running' && doc.visibilityState === 'visible' && win.navigator.onLine !== false && Date.now() >= cooldown; }
        function stop() {
            leader = false;
            if (interval) win.clearInterval(interval); interval = null;
            if (pending) pending.abort(); pending = null;
            state = { user, cursor: null, seen: new Set() }; lastSuccess = 0;
            if (release) { const done = release; release = null; done(); }
        }
        function persist() { try { win.localStorage.setItem(key, enabled ? 'on' : 'off'); } catch (_) {} }
        function audio() {
            if (!context) {
                context = new Audio();
                context.onstatechange = () => { if (context.state !== 'running') stop(); display(); };
            }
            return context;
        }
        async function poll() {
            if (!leader || !eligible() || pending) return;
            if (lastSuccess && Date.now() - lastSuccess > 60000) state = { user, cursor: null, seen: new Set() };
            const controller = new win.AbortController(); pending = controller;
            const timeout = win.setTimeout(() => controller.abort(), 8000);
            try {
                const url = new URL(endpoint.href);
                if (state.cursor) url.searchParams.set('cursor', state.cursor);
                const response = await win.fetch(url.href, { credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal: controller.signal, headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } });
                if (!leader || !eligible()) return;
                if (response.status === 401 || response.status === 403) { blocked = true; stop(); display('Access changed or session expired. Reload the staff page.'); return; }
                if (response.status === 422) { state = { user, cursor: null, seen: new Set() }; display('Rechecking the notification baseline; no replay sound.'); return; }
                if (response.status === 429) { cooldown = Date.now() + 60000; stop(); display('Checks paused briefly. They will retry while this tab is active.'); return; }
                if (!response.ok) throw new Error('Feed unavailable');
                const data = await response.json();
                if (!leader || !eligible()) return;
                if (data.user !== user) { blocked = true; stop(); display('Account changed. Reload the staff page.'); return; }
                const alert = accept(state, data); lastSuccess = Date.now();
                if (alert && eligible()) tone(context);
                display(data.overflow ? 'High-volume alerts: baseline refreshed without replay.' : 'On — checking your new unread alerts every 20 seconds.');
            } catch (error) {
                if (error.name !== 'AbortError' && leader) { state = { user, cursor: null, seen: new Set() }; display('Connection interrupted. The next check starts quietly.'); }
            } finally { win.clearTimeout(timeout); if (pending === controller) pending = null; }
        }
        async function attempt() {
            if (!eligible() || leader || acquiring) return;
            acquiring = true;
            try {
                await win.navigator.locks.request(lockName, { mode: 'exclusive', ifAvailable: true }, async (lock) => {
                    if (!lock || !eligible()) { if (eligible()) display('On — another staff tab is handling the sound checks.'); return; }
                    leader = true; state = { user, cursor: null, seen: new Set() };
                    const held = new Promise((resolve) => { release = resolve; });
                    await poll();
                    if (!leader || !eligible()) { stop(); return; }
                    interval = win.setInterval(poll, 20000);
                    await held;
                });
            } catch (_) { stop(); display('This browser could not coordinate staff-tab sound.'); }
            finally { acquiring = false; }
        }
        async function enableClick() {
            if (!supported || blocked) return;
            try {
                enabled = true; persist(); await audio().resume();
                display(context.state === 'running' ? 'Enabled. Establishing a quiet baseline.' : 'Tap Enable to allow audio in this page.');
                attempt();
            } catch (_) { enabled = false; persist(); stop(); display('Audio is blocked here. Check browser sound permissions.'); }
        }
        async function testClick() {
            if (!supported || blocked) return;
            try { await audio().resume(); tone(context); display(enabled ? 'Test sound played. Notification sound remains enabled.' : 'Test sound played. Automatic notification sound is still off.'); }
            catch (_) { display('Test sound blocked. Check browser permissions and device volume.'); }
        }
        function muteClick() { enabled = false; persist(); stop(); if (context) context.suspend().catch(() => {}); display('Muted in this browser for your account.'); }
        function visibility() { if (!eligible()) { stop(); if (enabled) display('Paused while this tab is hidden, offline or awaiting an audio gesture.'); } else attempt(); }
        function storage(event) { if (event.key === key) { enabled = event.newValue === 'on'; if (!enabled) { stop(); if (context) context.suspend().catch(() => {}); } display(enabled ? 'Tap Enable if this page needs audio permission.' : 'Muted in another staff tab.'); attempt(); } }
        function leave() { stop(); }
        enable.addEventListener('click', enableClick); test.addEventListener('click', testClick); mute.addEventListener('click', muteClick);
        doc.addEventListener('visibilitychange', visibility); win.addEventListener('online', visibility); win.addEventListener('offline', visibility); win.addEventListener('storage', storage); win.addEventListener('pagehide', leave);
        const heartbeat = win.setInterval(attempt, 3000);
        display(!supported ? 'Sound requires Web Audio and secure tab coordination (HTTPS or localhost) in a supported browser.' : enabled ? 'Tap Enable to allow sound in this page; preference is saved for this account/browser.' : 'Off by default. Enable in this browser.');
        // Saved consent may resume automatically only when the browser allows it. Otherwise a fresh click is required.
        if (supported && enabled) { try { audio(); if (context.state === 'running') attempt(); } catch (_) {} }
        const instance = { destroy() { destroyed = true; stop(); win.clearInterval(heartbeat); enable.removeEventListener('click', enableClick); test.removeEventListener('click', testClick); mute.removeEventListener('click', muteClick); doc.removeEventListener('visibilitychange', visibility); win.removeEventListener('online', visibility); win.removeEventListener('offline', visibility); win.removeEventListener('storage', storage); win.removeEventListener('pagehide', leave); if (context) { context.onstatechange = null; context.close().catch(() => {}); } } };
        win.__luxxeStaffSound = instance;
        return instance;
    }
    return { accept, tone, mount };
});

const { YDB } = require('@yandex-cloud/nodejs-sdk');
const crypto = require('crypto');

// Берем настройки из переменных окружения, которые мы добавили в Яндекс Облаке
const ENDPOINT = process.env.ENDPOINT || 'grpcs://ydb.serverless.yandexcloud.net:2135';
const DATABASE = process.env.DATABASE;

let driverP;
const drv = () => driverP || (driverP = (async () => {
    // Создаем драйвер для подключения к YDB с правами сервисного аккаунта функции
    const driver = new YDB.Driver({
        endpoint: ENDPOINT,
        database: DATABASE,
        credentials: YDB.iamMetadataCredentials()
    });
    await driver.ready();
    return driver;
})());

const unwrap = (v) => {
    if (v == null || typeof v !== 'object') return v;
    const ks = ['textValue','bytesValue','uint64Value','int64Value','uint32Value','int32Value','doubleValue','floatValue','boolValue'];
    for (const k of ks) if (k in v) return v[k];
    if ('value' in v) return unwrap(v.value);
    return v;
};

const norm = (row, rs) => {
    if (Array.isArray(row)) {
        const names = (rs.columns || []).map((c) => c.name);
        const o = {};
        row.forEach((v, i) => { o[names[i]] = unwrap(v); });
        return o;
    }
    if (row && typeof row === 'object') {
        if (Array.isArray(row.pairs)) {
            const o = {};
            row.pairs.forEach((p) => { o[p.key || p.name] = unwrap(p.value !== undefined ? p.value : p); });
            return o;
        }
        if (Array.isArray(row.items)) {
            const names = (rs.columns || []).map((c) => c.name);
            const o = {};
            row.items.forEach((v, i) => { o[names[i]] = unwrap(v); });
            return o;
        }
    }
    return row;
};

const q = async (sql) => {
    const d = await drv();
    return d.tableClient.withSession(async (s) => {
        const r = await s.executeQuery(sql);
        if (!r.resultSets || !r.resultSets[0]) return [];
        const rs = r.resultSets[0];
        return (rs.rows || []).map((row) => norm(row, rs));
    });
};

const esc = (s) => String(s ?? '').replace(/\\/g, '\\\\').replace(/'/g, "''");
const str = (v) => (v == null ? '' : (typeof v === 'string' ? v : String(v)));
const num = (n) => (n = Math.floor(Number(n)), Number.isFinite(n) && n > 0 ? n : 0);
const hash = (p, s) => crypto.scryptSync(String(p), s, 32).toString('hex');
const R = (o, c) => ({ statusCode: c || 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(o) });
const H = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };

module.exports.handler = async (e) => {
    if (e.httpMethod === 'OPTIONS') return { statusCode: 200, headers: H, body: '' };
    
    let b = {};
    try {
        if (typeof e === 'string') b = JSON.parse(e);
        else if (e.body) b = JSON.parse(e.isBase64Encoded ? Buffer.from(e.body, 'base64').toString() : e.body);
        else b = e;
    } catch (x) { return R({ ok: false, error: 'bad body' }, 400); }
    
    try {
        const a = b.action;
        
        if (a === 'register') {
            const em = String(b.email || '').toLowerCase().trim(), pw = String(b.password || '');
            if (!em || pw.length < 6) return R({ ok: false, error: 'нужен email и пароль от 6 символов' }, 400);
            if ((await q(`SELECT user_id FROM players WHERE user_id = '${esc(em)}';`)).length) return R({ ok: false, error: 'игрок уже есть' }, 400);
            const s = crypto.randomBytes(8).toString('hex');
            await q(`UPSERT INTO players (user_id, email, password_hash, silver, energy, game_data, last_saved) VALUES ('${esc(em)}', '${esc(em)}', '${s}:${hash(pw, s)}', 100, 50, '{}', '${new Date().toISOString()}');`);
            return R({ ok: true, userId: em, silver: 100, energy: 50 });
        }
        
        if (a === 'login') {
            const em = String(b.email || '').toLowerCase().trim();
            const r = await q(`SELECT * FROM players WHERE user_id = '${esc(em)}';`);
            if (!r.length) return R({ ok: false, error: 'игрок не найден' }, 404);
            const [s, h] = str(r[0].password_hash).split(':');
            if (!s || hash(b.password || '', s) !== h) return R({ ok: false, error: 'неверный пароль' }, 400);
            return R({ ok: true, userId: em });
        }
        
        if (a === 'load') {
            const r = await q(`SELECT * FROM players WHERE user_id = '${esc(String(b.user_id || '').toLowerCase().trim())}';`);
            if (!r.length) return R({ ok: false, error: 'игрок не найден' }, 404);
            let g = {}; try { g = JSON.parse(str(r[0].game_data) || '{}'); } catch (x) {}
            return R({ ok: true, silver: Number(str(r[0].silver)) || 0, energy: Number(str(r[0].energy)) || 0, gameData: g, lastSaved: str(r[0].last_saved) });
        }
        
        if (a === 'save') {
            const u = String(b.user_id || '').toLowerCase().trim();
            if (!u) return R({ ok: false, error: 'нет user_id' }, 400);
            const g = typeof b.game_data === 'string' ? b.game_data : JSON.stringify(b.game_data || {});
            await q(`UPSERT INTO players (user_id, silver, energy, game_data, last_saved) VALUES ('${esc(u)}', ${num(b.silver)}, ${num(b.energy)}, '${esc(g)}', '${new Date().toISOString()}');`);
            return R({ ok: true });
        }
        
        if (a === 'debug') {
            const r = await q(`SELECT user_id, password_hash FROM players WHERE user_id = '${esc(String(b.user_id || 'test2@game.ru'))}';`);
            const row = r[0] || {};
            const raw = str(row.password_hash);
            return R({ ok: true, keys: Object.keys(row), typeofHash: typeof row.password_hash, hashStr: raw, calc: hash('123456', raw.split(':')[0] || '') });
        }
        
        return R({ ok: true, message: 'Дверник на связи! Действия: register, login, load, save, debug 🎮' });
    } catch (x) {
        return R({ ok: false, error: String((x && x.message) || x) }, 500);
    }
};

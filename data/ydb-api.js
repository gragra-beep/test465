const GAME_API_URL = 'https://functions.yandexcloud.net/d4evop77t1copsou62j4';

async function api(action, payload) {
  const r = await fetch(GAME_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.assign({ action: action }, payload || {}))
  });
  const data = await r.json();
  if (!data.ok) throw new Error(data.error || 'Ошибка сервера');
  return data;
}

// ===== ТЕ ЖЕ КОМАНДЫ, ЧТО БЫЛИ У FIREBASE, НО ВНУТРИ — НАШ СЕРВЕР =====
window.firebaseAPI = {
  async createUserWithEmailAndPassword(auth, email, password) {
    const res = await api('register', { email: email, password: password });
    return { user: { uid: res.userId } };
  },
  async signInWithEmailAndPassword(auth, email, password) {
    const res = await api('login', { email: email, password: password });
    return { user: { uid: res.userId } };
  },
  doc(db, collection, uid) { return { uid: uid }; },
  async setDoc(ref, data, opts) {
    const g = Object.assign({}, data);
    const silver = g.silver; delete g.silver;
    const energy = g.energy; delete g.energy;
    await api('save', { user_id: ref.uid, silver: silver, energy: energy, game_data: g });
  },
  async updateDoc(ref, data) {
    const cur = await api('load', { user_id: ref.uid });
    const merged = Object.assign({}, cur.gameData, data);
    const silver = data.silver !== undefined ? data.silver : cur.silver;
    const energy = data.energy !== undefined ? data.energy : cur.energy;
    delete merged.silver; delete merged.energy;
    await api('save', { user_id: ref.uid, silver: silver, energy: energy, game_data: merged });
  },
  async getDoc(ref) {
    try {
      const res = await api('load', { user_id: ref.uid });
      return {
        exists: () => true,
        data: () => Object.assign({}, res.gameData, { silver: res.silver, energy: res.energy })
      };
    } catch (e) {
      return { exists: () => false, data: () => null };
    }
  }
};
window.firebaseAuth = { signOut: async () => {}, currentUser: null };
window.firebaseDb = {};

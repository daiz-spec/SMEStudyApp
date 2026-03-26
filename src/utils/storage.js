import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@sme_study_history';

export async function loadHistory() {
    try {
        const raw = await AsyncStorage.getItem(HISTORY_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        return {};
    }
}

export async function saveAnswer(questionId, isCorrect) {
    const history = await loadHistory();
    if (!history[questionId]) {
        history[questionId] = { correct: 0, incorrect: 0 };
    }
    if (isCorrect) {
        history[questionId].correct += 1;
    } else {
        history[questionId].incorrect += 1;
    }
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return history;
}

export async function clearHistory() {
    await AsyncStorage.removeItem(HISTORY_KEY);
}

export function getStats(history) {
    let totalCorrect = 0;
    let totalIncorrect = 0;
    for (const q of Object.values(history)) {
        totalCorrect += q.correct;
        totalIncorrect += q.incorrect;
    }
    const total = totalCorrect + totalIncorrect;
    const accuracy = total > 0 ? Math.round((totalCorrect / total) * 100) : 0;
    return { totalCorrect, totalIncorrect, total, accuracy };
}

import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    StatusBar, SafeAreaView, Alert,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';
import { loadHistory, clearHistory, getStats } from '../utils/storage';

const questionsData = require('../../assets/questions.json');

export default function HistoryScreen({ navigation }) {
    const [history, setHistory] = useState({});
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchHistory = useCallback(async () => {
        const h = await loadHistory();
        setHistory(h);
        setStats(getStats(h));
        setLoading(false);
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', fetchHistory);
        return unsubscribe;
    }, [navigation, fetchHistory]);

    const handleClear = () => {
        Alert.alert('記録をリセット', '全ての学習記録を削除しますか？', [
            { text: 'キャンセル', style: 'cancel' },
            {
                text: '削除する', style: 'destructive', onPress: async () => {
                    await clearHistory();
                    fetchHistory();
                }
            },
        ]);
    };

    const hasAnswered = Object.keys(history);
    const questionsWithHistory = questionsData.filter(q => hasAnswered.includes(q.id));

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>‹ 戻る</Text>
                </TouchableOpacity>
                <Text style={styles.title}>学習記録</Text>
                <TouchableOpacity onPress={handleClear}>
                    <Text style={styles.clearText}>リセット</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centered}><Text style={{ color: colors.textSecondary }}>読み込み中...</Text></View>
            ) : (
                <ScrollView contentContainerStyle={styles.scroll}>
                    {/* Stats Overview */}
                    {stats && (
                        <View style={styles.statsGrid}>
                            <View style={styles.statBox}>
                                <Text style={styles.statNum}>{stats.total}</Text>
                                <Text style={styles.statLabel}>累計回答</Text>
                            </View>
                            <View style={[styles.statBox, { borderColor: colors.success }]}>
                                <Text style={[styles.statNum, { color: colors.success }]}>{stats.totalCorrect}</Text>
                                <Text style={styles.statLabel}>正解</Text>
                            </View>
                            <View style={[styles.statBox, { borderColor: colors.error }]}>
                                <Text style={[styles.statNum, { color: colors.error }]}>{stats.totalIncorrect}</Text>
                                <Text style={styles.statLabel}>不正解</Text>
                            </View>
                            <View style={[styles.statBox, { borderColor: colors.primary }]}>
                                <Text style={[styles.statNum, { color: colors.primary }]}>{stats.accuracy}%</Text>
                                <Text style={styles.statLabel}>正解率</Text>
                            </View>
                        </View>
                    )}

                    {questionsWithHistory.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Text style={styles.emptyText}>まだ回答した問題がありません。</Text>
                            <Text style={styles.emptySubtext}>ホームから練習を始めましょう！</Text>
                        </View>
                    ) : (
                        <>
                            <Text style={styles.sectionTitle}>回答した問題</Text>
                            {questionsWithHistory.map((q) => {
                                const h = history[q.id];
                                const total = h.correct + h.incorrect;
                                const acc = total > 0 ? Math.round((h.correct / total) * 100) : 0;
                                return (
                                    <View key={q.id} style={styles.historyItem}>
                                        <View style={{ flex: 1 }}>
                                            <View style={styles.tagRow}>
                                                <Text style={styles.qTag}>{q.subject}</Text>
                                                <Text style={styles.qTag}>第{q.number}問</Text>
                                            </View>
                                            <Text style={styles.qText} numberOfLines={2}>{q.question}</Text>
                                        </View>
                                        <View style={styles.historyStats}>
                                            <Text style={[styles.accText, { color: acc >= 70 ? colors.success : colors.error }]}>
                                                {acc}%
                                            </Text>
                                            <Text style={styles.trialsText}>{total}回</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
        borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    backText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
    title: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
    clearText: { color: colors.error, fontSize: 14 },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    scroll: { padding: spacing.md, paddingBottom: 48 },
    statsGrid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg,
    },
    statBox: {
        flex: 1, minWidth: '40%', backgroundColor: colors.surfaceElevated,
        borderRadius: borderRadius.md, padding: spacing.md,
        alignItems: 'center', borderWidth: 1, borderColor: colors.border,
    },
    statNum: { fontSize: 28, fontWeight: '800', color: colors.textPrimary },
    statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
    emptyBox: { alignItems: 'center', paddingVertical: spacing.xxl },
    emptyText: { color: colors.textSecondary, fontSize: 16 },
    emptySubtext: { color: colors.textMuted, fontSize: 14, marginTop: 8 },
    sectionTitle: {
        fontSize: 12, color: colors.textMuted, textTransform: 'uppercase',
        letterSpacing: 1.2, marginBottom: spacing.sm, fontWeight: '600',
    },
    historyItem: {
        backgroundColor: colors.surfaceElevated, borderRadius: borderRadius.md,
        padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row',
        alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border,
    },
    tagRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
    qTag: {
        fontSize: 10, color: colors.textSecondary, backgroundColor: colors.border,
        paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
    },
    qText: { fontSize: 13, color: colors.textPrimary, lineHeight: 18 },
    historyStats: { alignItems: 'center', minWidth: 48 },
    accText: { fontSize: 20, fontWeight: '800' },
    trialsText: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
});

import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    StatusBar, SafeAreaView, TextInput,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';

const SUBJECTS = [
    { code: 'A', name: '経済学・経済政策', icon: '📈' },
    { code: 'B', name: '財務・会計', icon: '💰' },
    { code: 'C', name: '企業経営理論', icon: '🏢' },
    { code: 'D', name: '運営管理', icon: '⚙️' },
    { code: 'E', name: '経営法務', icon: '⚖️' },
    { code: 'F', name: '経営情報システム', icon: '💻' },
    { code: 'G', name: '中小企業経営・政策', icon: '🏭' },
];

export default function HomeScreen({ navigation, route }) {
    const [stats, setStats] = useState(route.params?.stats || null);

    const startStudy = (filter = {}) => {
        navigation.navigate('QuestionView', { filter });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.appTitle}>中小企業診断士</Text>
                    <Text style={styles.appSubtitle}>過去問トレーニング</Text>
                </View>

                {/* Quick Start Card */}
                <TouchableOpacity
                    style={styles.quickStartCard}
                    onPress={() => startStudy({})}
                    activeOpacity={0.85}
                >
                    <View style={styles.quickStartContent}>
                        <Text style={styles.quickStartIcon}>🚀</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.quickStartTitle}>ランダム出題</Text>
                            <Text style={styles.quickStartSub}>全科目・全年度からランダムに出題</Text>
                        </View>
                        <Text style={styles.arrowIcon}>›</Text>
                    </View>
                </TouchableOpacity>

                {/* Subject Filter */}
                <Text style={styles.sectionTitle}>科目で絞り込む</Text>
                <View style={styles.grid}>
                    {SUBJECTS.map((subj) => (
                        <TouchableOpacity
                            key={subj.code}
                            style={styles.subjectCard}
                            onPress={() => startStudy({ subject: subj.name })}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.subjectIcon}>{subj.icon}</Text>
                            <Text style={styles.subjectName}>{subj.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Year Filter */}
                <Text style={styles.sectionTitle}>年度で絞り込む</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearRow}>
                    {['R6', 'R5', 'R4', 'R3', 'R2', 'R1', 'H30'].map((yr) => (
                        <TouchableOpacity
                            key={yr}
                            style={styles.yearChip}
                            onPress={() => startStudy({ year: yr })}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.yearChipText}>{yr}年度</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Stats Card */}
                <TouchableOpacity
                    style={styles.statsCard}
                    onPress={() => navigation.navigate('History')}
                    activeOpacity={0.85}
                >
                    <Text style={styles.statsTitle}>📊 学習記録を見る</Text>
                    {stats ? (
                        <Text style={styles.statsSub}>
                            正解率: {stats.accuracy}%  |  累計 {stats.total}問
                        </Text>
                    ) : (
                        <Text style={styles.statsSub}>タップして確認する</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
    header: { alignItems: 'center', paddingVertical: spacing.xl },
    appTitle: {
        fontSize: 26, fontWeight: '800', color: colors.primary,
        letterSpacing: 1,
    },
    appSubtitle: {
        fontSize: 14, color: colors.textSecondary, marginTop: 4,
    },
    quickStartCard: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.lg,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    quickStartContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    quickStartIcon: { fontSize: 28 },
    quickStartTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
    quickStartSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    arrowIcon: { fontSize: 28, color: '#fff', fontWeight: '300' },
    sectionTitle: {
        ...typography.label,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        marginTop: spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    grid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    subjectCard: {
        backgroundColor: colors.surfaceElevated,
        borderRadius: borderRadius.md,
        padding: spacing.sm,
        width: '47%',
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    },
    subjectIcon: { fontSize: 20 },
    subjectName: { fontSize: 12, color: colors.textPrimary, fontWeight: '500', flex: 1 },
    yearRow: { marginBottom: spacing.lg },
    yearChip: {
        backgroundColor: colors.surfaceElevated,
        borderRadius: borderRadius.full,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        marginRight: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    yearChipText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
    statsCard: {
        backgroundColor: colors.surfaceElevated,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        marginTop: spacing.sm,
    },
    statsTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
    statsSub: { fontSize: 13, color: colors.textSecondary },
});

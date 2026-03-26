import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    StatusBar, SafeAreaView, Animated, ActivityIndicator,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { saveAnswer, loadHistory } from '../utils/storage';

const questionsData = require('../../assets/questions.json');

function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export default function QuestionViewScreen({ navigation, route }) {
    const { filter = {} } = route.params || {};

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });
    const [loading, setLoading] = useState(true);
    const [fadeAnim] = useState(new Animated.Value(1));

    useEffect(() => {
        let filtered = questionsData;
        if (filter.subject) filtered = filtered.filter(q => q.subject === filter.subject);
        if (filter.year) filtered = filtered.filter(q => q.year === filter.year);
        // Remove questions without answers or options
        filtered = filtered.filter(q => q.answer && q.options && Object.keys(q.options).length > 0);
        setQuestions(shuffleArray(filtered));
        setLoading(false);
    }, []);

    const currentQ = questions[currentIndex];

    const handleAnswer = useCallback(async (option) => {
        if (selectedOption !== null) return;
        setSelectedOption(option);
        const isCorrect = option === currentQ.answer;
        await saveAnswer(currentQ.id, isCorrect);
        setSessionStats(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            incorrect: prev.incorrect + (isCorrect ? 0 : 1),
        }));
        setShowExplanation(true);
    }, [selectedOption, currentQ]);

    const nextQuestion = () => {
        if (currentIndex >= questions.length - 1) {
            navigation.navigate('Home', { stats: sessionStats });
            return;
        }
        Animated.timing(fadeAnim, {
            toValue: 0, duration: 150, useNativeDriver: true,
        }).start(() => {
            setCurrentIndex(i => i + 1);
            setSelectedOption(null);
            setShowExplanation(false);
            Animated.timing(fadeAnim, {
                toValue: 1, duration: 200, useNativeDriver: true,
            }).start();
        });
    };

    if (loading || !currentQ) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.textSecondary, marginTop: 16 }}>問題を読み込んでいます...</Text>
            </View>
        );
    }

    if (questions.length === 0) {
        return (
            <View style={styles.loading}>
                <Text style={{ color: colors.textPrimary, fontSize: 18 }}>該当する問題がありません</Text>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={{ color: colors.primary }}>戻る</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const optionKeys = Object.keys(currentQ.options).sort();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnHeader}>
                    <Text style={styles.backText}>‹ 終了</Text>
                </TouchableOpacity>
                <View style={styles.progressContainer}>
                    <Text style={styles.counterText}>{currentIndex + 1} / {questions.length}</Text>
                </View>
                <View style={styles.sessionStats}>
                    <Text style={styles.correctText}>✓ {sessionStats.correct}</Text>
                    <Text style={styles.incorrectText}>✗ {sessionStats.incorrect}</Text>
                </View>
            </View>

            {/* Progress bar */}
            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${((currentIndex + 1) / questions.length) * 100}%` }]} />
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    {/* Subject & Year tag */}
                    <View style={styles.tagRow}>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>{currentQ.subject}</Text>
                        </View>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>第{currentQ.number}問 / {currentQ.year}年度</Text>
                        </View>
                    </View>

                    {/* Question */}
                    <View style={styles.questionCard}>
                        <Text style={styles.questionText}>{currentQ.question}</Text>
                    </View>

                    {/* Options */}
                    {optionKeys.map((key) => {
                        const isSelected = selectedOption === key;
                        const isCorrect = key === currentQ.answer;
                        let optStyle = styles.optionCard;
                        let optTextStyle = styles.optionText;
                        let badge = null;

                        if (selectedOption !== null) {
                            if (isCorrect) {
                                optStyle = [styles.optionCard, styles.optionCorrect];
                                badge = <Text style={styles.badgeCorrect}>✓ 正解</Text>;
                            } else if (isSelected && !isCorrect) {
                                optStyle = [styles.optionCard, styles.optionIncorrect];
                                badge = <Text style={styles.badgeIncorrect}>✗ 不正解</Text>;
                            } else {
                                optStyle = [styles.optionCard, styles.optionDimmed];
                            }
                        }

                        return (
                            <TouchableOpacity
                                key={key}
                                style={optStyle}
                                onPress={() => handleAnswer(key)}
                                activeOpacity={0.8}
                                disabled={selectedOption !== null}
                            >
                                <View style={styles.optionKey}>
                                    <Text style={styles.optionKeyText}>{key}</Text>
                                </View>
                                <Text style={[styles.optionText, { flex: 1 }]}>{currentQ.options[key]}</Text>
                                {badge}
                            </TouchableOpacity>
                        );
                    })}

                    {/* Explanation */}
                    {showExplanation && (
                        <View style={styles.explanationCard}>
                            <Text style={styles.explanationTitle}>
                                {selectedOption === currentQ.answer ? '🎉 正解！' : `💡 正解は「${currentQ.answer}」`}
                            </Text>
                            <Text style={styles.explanationText}>
                                {currentQ.explanation || `この問題の正解は「${currentQ.answer}」です。`}
                            </Text>
                        </View>
                    )}
                </Animated.View>
            </ScrollView>

            {/* Next Button */}
            {showExplanation && (
                <View style={styles.nextBtnWrapper}>
                    <TouchableOpacity style={styles.nextBtn} onPress={nextQuestion} activeOpacity={0.85}>
                        <Text style={styles.nextBtnText}>
                            {currentIndex >= questions.length - 1 ? '結果を見る' : '次の問題 ›'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const optionTextStyle = {
    fontSize: 14, color: colors.textPrimary, lineHeight: 22, flexShrink: 1,
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loading: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    },
    backBtnHeader: { paddingRight: spacing.sm },
    backText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
    counterText: { color: colors.textSecondary, fontSize: 14 },
    progressContainer: { flex: 1, alignItems: 'center' },
    sessionStats: { flexDirection: 'row', gap: spacing.sm },
    correctText: { color: colors.success, fontWeight: '700', fontSize: 14 },
    incorrectText: { color: colors.error, fontWeight: '700', fontSize: 14 },
    progressBar: { height: 3, backgroundColor: colors.border },
    progressFill: { height: '100%', backgroundColor: colors.primary },
    scroll: { flex: 1, paddingHorizontal: spacing.md },
    tagRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, marginBottom: spacing.sm, flexWrap: 'wrap' },
    tag: {
        backgroundColor: colors.surfaceElevated, borderRadius: borderRadius.full,
        paddingHorizontal: spacing.sm, paddingVertical: 4, borderWidth: 1, borderColor: colors.border,
    },
    tagText: { color: colors.textSecondary, fontSize: 11, fontWeight: '500' },
    questionCard: {
        backgroundColor: colors.surface, borderRadius: borderRadius.lg,
        padding: spacing.md, marginBottom: spacing.md,
        borderWidth: 1, borderColor: colors.border,
        ...shadows.card,
    },
    questionText: {
        fontSize: 15, color: colors.textPrimary, lineHeight: 26, fontWeight: '500',
    },
    optionCard: {
        backgroundColor: colors.surfaceElevated, borderRadius: borderRadius.md,
        padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row',
        alignItems: 'flex-start', borderWidth: 1, borderColor: colors.border, gap: spacing.sm,
    },
    optionCorrect: {
        borderColor: colors.success, backgroundColor: 'rgba(63, 185, 80, 0.08)',
    },
    optionIncorrect: {
        borderColor: colors.error, backgroundColor: 'rgba(248, 81, 73, 0.08)',
    },
    optionDimmed: {
        opacity: 0.5,
    },
    optionKey: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
    optionKeyText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
    optionText: { fontSize: 14, color: colors.textPrimary, lineHeight: 22, flex: 1 },
    badgeCorrect: {
        color: colors.success, fontSize: 12, fontWeight: '700', flexShrink: 0,
    },
    badgeIncorrect: {
        color: colors.error, fontSize: 12, fontWeight: '700', flexShrink: 0,
    },
    explanationCard: {
        backgroundColor: colors.surfaceElevated, borderRadius: borderRadius.lg,
        padding: spacing.md, marginTop: spacing.sm,
        borderWidth: 1, borderColor: colors.primary,
        borderLeftWidth: 4,
    },
    explanationTitle: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: spacing.sm },
    explanationText: { fontSize: 14, color: colors.textPrimary, lineHeight: 24 },
    nextBtnWrapper: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: spacing.md, backgroundColor: colors.background,
        borderTopWidth: 1, borderTopColor: colors.border,
    },
    nextBtn: {
        backgroundColor: colors.primary, borderRadius: borderRadius.md,
        padding: spacing.md, alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8,
    },
    nextBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
    backBtn: { marginTop: 16, padding: 8 },
});

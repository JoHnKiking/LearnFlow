import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CUTE_COLORS, SPACING, BORDER_RADIUS } from '../../src/utils/constants';

interface Note {
  id: string;
  content: string;
  date: string;
}

const NotesScreen = () => {
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      content: '今天学习了React Native的组件化开发，感觉很有趣！',
      date: '2026-02-25',
    },
    {
      id: '2',
      content: '完成了第一个项目的原型设计，加油！',
      date: '2026-02-24',
    },
  ]);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const note: Note = {
      id: Date.now().toString(),
      content: newNote,
      date: new Date().toISOString().split('T')[0],
    };
    
    setNotes([note, ...notes]);
    setNewNote('');
  };

  const getNoteEmoji = (index: number) => {
    const emojis = ['📝', '✨', '🌸', '🍀', '🌟', '💖', '🎨', '📚'];
    return emojis[index % emojis.length];
  };

  const getNoteColor = (index: number) => {
    const colors = [
      CUTE_COLORS.PINK,
      CUTE_COLORS.SKY_BLUE,
      CUTE_COLORS.MINT,
      CUTE_COLORS.BUTTER_YELLOW,
      CUTE_COLORS.LAVENDER,
    ];
    return colors[index % colors.length];
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📒 我的笔记</Text>
      </View>
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.content}>
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>✏️ 写点什么吧~</Text>
            <TextInput
              style={styles.textArea}
              value={newNote}
              onChangeText={setNewNote}
              placeholder="今天学了什么？"
              placeholderTextColor={CUTE_COLORS.GRAY}
              multiline={true}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[
                styles.saveButton,
                newNote.trim() ? styles.saveButtonActive : styles.saveButtonDisabled,
              ]}
              onPress={handleAddNote}
              disabled={!newNote.trim()}
            >
              <Text
                style={[
                  styles.saveButtonText,
                  newNote.trim() ? styles.saveButtonTextActive : styles.saveButtonTextDisabled,
                ]}
              >
                保存笔记
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>📋 历史笔记</Text>
            {notes.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>还没有笔记哦~</Text>
                <Text style={styles.emptyHint}>开始记录你的学习旅程吧！</Text>
              </View>
            ) : (
              notes.map((note, index) => (
                <View key={note.id} style={styles.noteCard}>
                  <View style={styles.noteHeader}>
                    <Text style={styles.noteEmoji}>{getNoteEmoji(index)}</Text>
                    <Text style={[styles.noteDate, { color: getNoteColor(index) }]}>
                      {note.date}
                    </Text>
                  </View>
                  <Text style={styles.noteContent}>{note.content}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CUTE_COLORS.WARM_WHITE,
  },
  header: {
    padding: SPACING.LARGE,
    borderBottomWidth: 3,
    borderBottomColor: CUTE_COLORS.LIGHT_PINK,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: CUTE_COLORS.DARK_GRAY,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.LARGE,
  },
  inputCard: {
    backgroundColor: CUTE_COLORS.CREAM,
    borderRadius: BORDER_RADIUS.LARGE,
    padding: SPACING.LARGE,
    marginBottom: SPACING.LARGE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: CUTE_COLORS.DARK_GRAY,
    marginBottom: SPACING.MEDIUM,
  },
  textArea: {
    height: 120,
    borderWidth: 2,
    borderColor: CUTE_COLORS.LIGHT_PINK,
    backgroundColor: CUTE_COLORS.WHITE,
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.MEDIUM,
    fontSize: 16,
    color: CUTE_COLORS.DARK_GRAY,
    borderRadius: BORDER_RADIUS.MEDIUM,
    marginBottom: SPACING.MEDIUM,
  },
  saveButton: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.MEDIUM,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonActive: {
    backgroundColor: CUTE_COLORS.PINK,
  },
  saveButtonDisabled: {
    backgroundColor: CUTE_COLORS.GRAY,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  saveButtonTextActive: {
    color: CUTE_COLORS.WHITE,
  },
  saveButtonTextDisabled: {
    color: CUTE_COLORS.DARK_GRAY,
  },
  notesSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: CUTE_COLORS.DARK_GRAY,
    marginBottom: SPACING.MEDIUM,
  },
  emptyCard: {
    backgroundColor: CUTE_COLORS.LIGHT_BLUE,
    borderRadius: BORDER_RADIUS.LARGE,
    padding: SPACING.XLARGE,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyText: {
    fontSize: 18,
    color: CUTE_COLORS.DARK_GRAY,
    marginBottom: SPACING.SMALL,
  },
  emptyHint: {
    fontSize: 14,
    color: CUTE_COLORS.GRAY,
  },
  noteCard: {
    backgroundColor: CUTE_COLORS.WHITE,
    borderRadius: BORDER_RADIUS.LARGE,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
    borderWidth: 2,
    borderColor: CUTE_COLORS.LIGHT_PINK,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  noteEmoji: {
    fontSize: 24,
    marginRight: SPACING.MEDIUM,
  },
  noteDate: {
    fontSize: 14,
    fontWeight: '700',
  },
  noteContent: {
    fontSize: 16,
    color: CUTE_COLORS.DARK_GRAY,
    lineHeight: 24,
  },
});

export default NotesScreen;

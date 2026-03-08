import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../src/utils/constants';

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
      COLORS.PINK,
      COLORS.PRIMARY,
      COLORS.SUCCESS,
      COLORS.ORANGE,
      COLORS.PURPLE,
    ];
    return colors[index % colors.length];
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>📒 我的笔记</Text>
      </View>
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>✏️ 写点什么吧~</Text>
            <TextInput
              style={styles.textArea}
              value={newNote}
              onChangeText={setNewNote}
              placeholder="今天学了什么？"
              placeholderTextColor={COLORS.TEXT_TERTIARY}
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
              activeOpacity={0.7}
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

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputCard: {
    borderRadius: 16,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    padding: 16,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 100,
    borderRadius: 12,
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },
  saveButton: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  saveButtonActive: {
    backgroundColor: COLORS.PINK,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.TEXT_TERTIARY,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  saveButtonTextActive: {
    color: '#fff',
  },
  saveButtonTextDisabled: {
    color: COLORS.TEXT_TERTIARY,
  },
  notesSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },
  emptyCard: {
    borderRadius: 16,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  emptyHint: {
    fontSize: 13,
    color: COLORS.TEXT_TERTIARY,
  },
  noteCard: {
    borderRadius: 16,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    padding: 16,
    marginBottom: 12,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  noteEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  noteDate: {
    fontSize: 13,
    fontWeight: '700',
  },
  noteContent: {
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 22,
  },
  bottomPadding: {
    height: 100,
  },
});

export default NotesScreen;

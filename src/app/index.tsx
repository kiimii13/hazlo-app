import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTasks } from '@/hooks/use-tasks';
import type { Task } from '@/lib/tasks';

const colors = {
  paper: '#F1F7F2',
  ink: '#183B2B',
  forest: '#1F5D42',
  green: '#2F7D5A',
  mist: '#C9DED0',
  white: '#FFFFFF',
  muted: '#5B7467',
  input: '#FAFDF9',
  error: '#A33A3A',
  errorSurface: '#FCE8E5',
  overlay: 'rgba(24, 59, 43, 0.45)',
};
const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  web: 'system-ui',
  default: 'sans-serif',
});

export default function HomeScreen() {
  const { tasks, isLoading, error, addTask, removeTask } = useTasks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const canSave = title.trim().length > 0 && description.trim().length > 0;
  const taskCountLabel = tasks.length === 1 ? '1 tarea pendiente' : `${tasks.length} tareas pendientes`;

  async function handleSave() {
    if (!canSave || isSaving || deletingTaskId) return;

    setIsSaving(true);
    try {
      if (await addTask(title, description)) {
        setTitle('');
        setDescription('');
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!taskToDelete) return;

    setDeletingTaskId(taskToDelete.id);
    try {
      await removeTask(taskToDelete.id);
    } finally {
      setDeletingTaskId(null);
      setTaskToDelete(null);
    }
  }

  function confirmDelete(task: Task) {
    setTaskToDelete(task);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.brand}>Hazlo</Text>
            <Text style={styles.count}>{taskCountLabel}</Text>
            <Text style={styles.intro}>Saca una cosa de tu cabeza y ponla en marcha.</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Nueva tarea</Text>
            <Text style={styles.label}>Título</Text>
            <TextInput
              accessibilityLabel="Título de la tarea"
              autoCapitalize="sentences"
              onChangeText={setTitle}
              placeholder="Ej. Preparar la propuesta"
              placeholderTextColor={colors.muted}
              returnKeyType="next"
              style={styles.input}
              value={title}
            />
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              accessibilityLabel="Descripción de la tarea"
              autoCapitalize="sentences"
              multiline
              numberOfLines={4}
              onChangeText={setDescription}
              placeholder="Añade el contexto que necesites"
              placeholderTextColor={colors.muted}
              style={[styles.input, styles.descriptionInput]}
              textAlignVertical="top"
              value={description}
            />
            {!canSave && <Text style={styles.helper}>Completa el título y la descripción para guardar.</Text>}
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSave || isSaving }}
              disabled={!canSave || isSaving || Boolean(deletingTaskId)}
              onPress={() => void handleSave()}
              style={({ pressed }) => [
                styles.primaryButton,
                (!canSave || isSaving || deletingTaskId) && styles.disabledButton,
                pressed && canSave && styles.pressed,
              ]}>
              <Text
                style={[
                  styles.primaryButtonText,
                  (!canSave || isSaving || deletingTaskId) && styles.disabledButtonText,
                ]}>
                {isSaving ? 'Guardando…' : 'Guardar tarea'}
              </Text>
            </Pressable>
          </View>

          {error && (
            <View accessibilityRole="alert" style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>Tus tareas</Text>
            {isLoading && <Text style={styles.muted}>Cargando…</Text>}
          </View>

          {!isLoading && tasks.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Todavía no hay tareas</Text>
              <Text style={styles.muted}>La primera puede empezar con algo pequeño.</Text>
            </View>
          ) : (
            <View style={styles.taskList}>
              {tasks.map((task) => (
                <View key={task.id} style={styles.task}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskDescription}>{task.description}</Text>
                  <Pressable
                    accessibilityLabel={`Eliminar tarea ${task.title}`}
                    accessibilityRole="button"
                    accessibilityState={{
                      disabled: Boolean(deletingTaskId) || isSaving,
                    }}
                    disabled={Boolean(deletingTaskId) || isSaving}
                    hitSlop={8}
                    onPress={() => confirmDelete(task)}
                    style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}>
                    <Text style={styles.deleteText}>
                      {deletingTaskId === task.id ? 'Eliminando…' : 'Eliminar'}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal
        animationType="fade"
        onRequestClose={() => setTaskToDelete(null)}
        transparent
        visible={Boolean(taskToDelete)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Eliminar tarea</Text>
            <Text style={styles.modalMessage}>
              ¿Quieres eliminar «{taskToDelete?.title}»?
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setTaskToDelete(null)}
                style={styles.modalCancelButton}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={Boolean(deletingTaskId)}
                onPress={() => void handleDelete()}
                style={styles.modalDeleteButton}>
                <Text style={styles.modalDeleteText}>
                  {deletingTaskId ? 'Eliminando…' : 'Eliminar'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  keyboard: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 24,
    paddingBottom: 28,
  },
  brand: {
    color: colors.green,
    fontFamily,
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: -1.2,
    lineHeight: 48,
  },
  count: {
    color: colors.ink,
    fontFamily,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginTop: 4,
  },
  intro: {
    color: colors.muted,
    fontFamily,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  form: {
    backgroundColor: colors.white,
    borderColor: colors.mist,
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  sectionTitle: {
    color: colors.ink,
    fontFamily,
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  label: {
    color: colors.ink,
    fontFamily,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 8,
    marginTop: 18,
  },
  input: {
    backgroundColor: colors.input,
    borderColor: colors.mist,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.ink,
    fontFamily,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  descriptionInput: {
    minHeight: 112,
  },
  helper: {
    color: colors.muted,
    fontFamily,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 10,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#187A4B',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 48,
    marginTop: 18,
  },
  primaryButtonText: {
    color: colors.white,
    fontFamily,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  disabledButton: {
    backgroundColor: '#D8E5DB',
  },
  disabledButtonText: {
    color: '#5D7567',
  },
  pressed: {
    opacity: 0.75,
  },
  errorBox: {
    backgroundColor: colors.errorSurface,
    borderRadius: 12,
    marginTop: 16,
    padding: 14,
  },
  errorText: {
    color: colors.error,
    fontFamily,
    fontSize: 14,
    lineHeight: 20,
  },
  listHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    marginBottom: 12,
  },
  muted: {
    color: colors.muted,
    fontFamily,
    fontSize: 14,
    lineHeight: 20,
  },
  empty: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.mist,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  emptyTitle: {
    color: colors.ink,
    fontFamily,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 4,
  },
  taskList: {
    backgroundColor: colors.white,
    borderRadius: 18,
    overflow: 'hidden',
  },
  task: {
    borderBottomColor: colors.mist,
    borderBottomWidth: StyleSheet.hairlineWidth,
    padding: 18,
  },
  taskTitle: {
    color: colors.ink,
    fontFamily,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.1,
    lineHeight: 22,
  },
  taskDescription: {
    color: colors.muted,
    fontFamily,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
  },
  deleteButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
    marginTop: 8,
  },
  deleteText: {
    color: colors.error,
    fontFamily,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    maxWidth: 420,
    padding: 22,
    width: '100%',
  },
  modalTitle: {
    color: colors.ink,
    fontFamily,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 25,
  },
  modalMessage: {
    color: colors.muted,
    fontFamily,
    fontSize: 16,
    lineHeight: 23,
    marginTop: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    marginTop: 22,
  },
  modalCancelButton: {
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
  },
  modalCancelText: {
    color: colors.ink,
    fontFamily,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  modalDeleteButton: {
    alignItems: 'center',
    backgroundColor: colors.error,
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
  },
  modalDeleteText: {
    color: colors.white,
    fontFamily,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
});
 

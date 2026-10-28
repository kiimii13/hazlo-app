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
  paper: '#F7F3ED',
  ink: '#252127',
  plum: '#5A3153',
  mist: '#E4DDD5',
  white: '#FFFFFF',
  error: '#A33A3A',
};

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
            <Text style={styles.brand}>hazlo</Text>
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
              placeholderTextColor="#8E858A"
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
              placeholderTextColor="#8E858A"
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
              <Text style={styles.primaryButtonText}>{isSaving ? 'Guardando…' : 'Guardar tarea'}</Text>
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
    color: colors.plum,
    fontFamily: 'Georgia',
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -1,
  },
  count: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  intro: {
    color: '#655C61',
    fontSize: 16,
    lineHeight: 23,
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
    fontSize: 22,
    fontWeight: '700',
  },
  label: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 18,
  },
  input: {
    backgroundColor: '#FCFAF7',
    borderColor: colors.mist,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  descriptionInput: {
    minHeight: 112,
  },
  helper: {
    color: '#756B70',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 10,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.plum,
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 48,
    marginTop: 18,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.75,
  },
  errorBox: {
    backgroundColor: '#FCE8E5',
    borderRadius: 12,
    marginTop: 16,
    padding: 14,
  },
  errorText: {
    color: colors.error,
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
    color: '#756B70',
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
    fontSize: 16,
    fontWeight: '700',
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
    fontSize: 18,
    fontWeight: '700',
  },
  taskDescription: {
    color: '#655C61',
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
    fontSize: 14,
    fontWeight: '700',
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(37, 33, 39, 0.45)',
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
    fontSize: 20,
    fontWeight: '700',
  },
  modalMessage: {
    color: '#655C61',
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
    fontSize: 14,
    fontWeight: '700',
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
    fontSize: 14,
    fontWeight: '700',
  },
});
 

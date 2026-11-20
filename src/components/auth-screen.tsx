import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

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
};
const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  web: 'system-ui',
  default: 'sans-serif',
});

type AuthScreenProps = {
  error: string | null;
  isSubmitting: boolean;
  onLogin: (username: string, password: string) => Promise<boolean>;
  onRegister: (username: string, password: string) => Promise<boolean>;
};

export function AuthScreen({ error, isSubmitting, onLogin, onRegister }: AuthScreenProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const canSubmit = username.trim().length > 0 && password.length > 0 && !isSubmitting;

  async function handleSubmit() {
    if (!canSubmit) return;

    const succeeded = isRegistering
      ? await onRegister(username, password)
      : await onLogin(username, password);

    if (succeeded) {
      setPassword('');
    }
  }

  function toggleMode() {
    setIsRegistering((current) => !current);
    setPassword('');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.brand}>Hazlo</Text>
            <Text style={styles.title}>{isRegistering ? 'Crea tu cuenta' : 'Tus tareas privadas'}</Text>
            <Text style={styles.intro}>
              {isRegistering
                ? 'Registra un usuario para proteger tus tareas en este dispositivo.'
                : 'Inicia sesión para consultar y gestionar tus tareas.'}
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Usuario</Text>
            <TextInput
              accessibilityLabel="Usuario"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              onChangeText={setUsername}
              placeholder="Ej. ana"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={username}
            />
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              accessibilityLabel="Contraseña"
              autoCapitalize="none"
              autoComplete={isRegistering ? 'new-password' : 'password'}
              onChangeText={setPassword}
              onSubmitEditing={() => void handleSubmit()}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={colors.muted}
              secureTextEntry
              style={styles.input}
              value={password}
            />

            {isRegistering && <Text style={styles.helper}>Solo se guarda un hash de la contraseña.</Text>}
            {error && (
              <View accessibilityRole="alert" style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSubmit }}
              disabled={!canSubmit}
              onPress={() => void handleSubmit()}
              style={({ pressed }) => [
                styles.primaryButton,
                !canSubmit && styles.disabledButton,
                pressed && canSubmit && styles.pressed,
              ]}>
              <Text style={[styles.primaryButtonText, !canSubmit && styles.disabledButtonText]}>
                {isSubmitting ? 'Procesando…' : isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}
              </Text>
            </Pressable>
          </View>

          <Pressable accessibilityRole="button" disabled={isSubmitting} onPress={toggleMode} style={styles.modeButton}>
            <Text style={styles.modeText}>
              {isRegistering ? 'Ya tengo una cuenta' : 'Crear una cuenta nueva'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.paper,
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  content: {
    justifyContent: 'center',
    maxWidth: 520,
    minHeight: '100%',
    padding: 20,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
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
  title: {
    color: colors.ink,
    fontFamily,
    fontSize: 25,
    fontWeight: '800',
    lineHeight: 31,
    marginTop: 16,
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
  label: {
    color: colors.ink,
    fontFamily,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 8,
    marginTop: 16,
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
    lineHeight: 20,
  },
  disabledButton: {
    backgroundColor: '#D8E5DB',
  },
  disabledButtonText: {
    color: '#5D7567',
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
  modeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginTop: 12,
  },
  modeText: {
    color: colors.forest,
    fontFamily,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.75,
  },
});

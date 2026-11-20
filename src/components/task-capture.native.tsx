import { CameraView, useCameraPermissions } from 'expo-camera';
import { Directory, File, Paths } from 'expo-file-system';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { useRef, useState } from 'react';
import { Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Task } from '@/lib/tasks';

export type TaskAttachmentValues = Pick<Task, 'photoUri' | 'latitude' | 'longitude'>;

type TaskCaptureProps = {
  disabled: boolean;
  value: TaskAttachmentValues;
  onChange: (value: TaskAttachmentValues) => void;
};

const colors = {
  ink: '#183B2B',
  forest: '#1F5D42',
  green: '#2F7D5A',
  mist: '#C9DED0',
  white: '#FFFFFF',
  muted: '#5B7467',
  error: '#A33A3A',
  errorSurface: '#FCE8E5',
};

export function TaskCapture({ disabled, value, onChange }: TaskCaptureProps) {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const [locationPermission, requestLocationPermission] = Location.useForegroundPermissions();
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockedPermission, setBlockedPermission] = useState<'camera' | 'location' | null>(null);

  const cameraRef = useRef<CameraView>(null);

  async function handleOpenCamera() {
    if (disabled || isCapturing) return;

    setError(null);
    setBlockedPermission(null);
    const permission = cameraPermission?.granted
      ? cameraPermission
      : await requestCameraPermission();

    if (!permission.granted) {
      setError(
        permission.canAskAgain
          ? 'No se concedió permiso para usar la cámara. Puedes guardar la tarea sin foto.'
          : 'El permiso de cámara está bloqueado. Actívalo en ajustes para adjuntar una foto.',
      );
      setBlockedPermission(permission.canAskAgain ? null : 'camera');
      return;
    }

    setIsCameraReady(false);
    setBlockedPermission(null);
    setIsCameraVisible(true);
  }

  async function handleCapture() {
    if (!cameraRef.current || !isCameraReady || isCapturing) return;

    setIsCapturing(true);
    setError(null);

    try {
      const picture = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (!picture?.uri) throw new Error('La cámara no devolvió una imagen.');

      const directory = new Directory(Paths.document, 'task-images');
      directory.create({ idempotent: true, intermediates: true });

      const destination = new File(directory, `${Date.now()}.jpg`);
      await new File(picture.uri).copy(destination);

      onChange({ ...value, photoUri: destination.uri });
      setIsCameraVisible(false);
    } catch {
      setError('No se pudo guardar la foto. Puedes guardar la tarea sin imagen.');
    } finally {
      setIsCapturing(false);
    }
  }

  async function handleLocation() {
    if (disabled || isLocating) return;

    setIsLocating(true);
    setError(null);
    setBlockedPermission(null);

    try {
      const permission = locationPermission?.granted
        ? locationPermission
        : await requestLocationPermission();
      if (!permission.granted) {
        setError(
          permission.canAskAgain
            ? 'No se concedió permiso para usar la ubicación. Puedes guardar la tarea sin GPS.'
            : 'El permiso de ubicación está bloqueado. Actívalo en ajustes para registrar el GPS.',
        );
        setBlockedPermission(permission.canAskAgain ? null : 'location');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      onChange({
        ...value,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch {
      setError('No se pudo obtener la ubicación. Puedes guardar la tarea sin GPS.');
    } finally {
      setIsLocating(false);
    }
  }

  function clearPhoto() {
    onChange({ ...value, photoUri: undefined });
  }

  function clearLocation() {
    onChange({ ...value, latitude: undefined, longitude: undefined });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Datos opcionales</Text>
      <Text style={styles.description}>
        Puedes adjuntar una foto y registrar el lugar donde creas la tarea.
      </Text>
      <Text style={styles.permissionStatus}>
        Cámara:{' '}
        {cameraPermission === null
          ? 'comprobando permiso…'
          : cameraPermission.granted
            ? 'permiso concedido'
            : cameraPermission.canAskAgain
              ? 'se solicitará al adjuntar'
              : 'bloqueado; revisa ajustes'}
        {' · '}
        GPS:{' '}
        {locationPermission === null
          ? 'comprobando permiso…'
          : locationPermission.granted
            ? 'permiso concedido'
            : locationPermission.canAskAgain
              ? 'se solicitará al registrar'
              : 'bloqueado; revisa ajustes'}
      </Text>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={value.photoUri ? 'Cambiar foto' : 'Adjuntar foto'}
          disabled={disabled || isCapturing}
          onPress={() => void handleOpenCamera()}
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
          <Text style={styles.actionText}>{value.photoUri ? 'Cambiar foto' : 'Adjuntar foto'}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Registrar ubicación"
          disabled={disabled || isLocating}
          onPress={() => void handleLocation()}
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
          <Text style={styles.actionText}>{isLocating ? 'Obteniendo…' : 'Registrar ubicación'}</Text>
        </Pressable>
      </View>
      {value.photoUri && <Image accessibilityLabel="Foto adjunta" source={{ uri: value.photoUri }} style={styles.preview} />}
      {value.photoUri && <Text style={styles.status}>Foto adjunta</Text>}
      {value.photoUri && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quitar foto"
          disabled={disabled}
          onPress={clearPhoto}
          style={styles.removeButton}>
          <Text style={styles.removeText}>Quitar foto</Text>
        </Pressable>
      )}
      {value.latitude !== undefined && value.longitude !== undefined && (
        <Text style={styles.status}>
          Ubicación registrada: {value.latitude.toFixed(4)}, {value.longitude.toFixed(4)}
        </Text>
      )}
      {value.latitude !== undefined && value.longitude !== undefined && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quitar ubicación"
          disabled={disabled}
          onPress={clearLocation}
          style={styles.removeButton}>
          <Text style={styles.removeText}>Quitar ubicación</Text>
        </Pressable>
      )}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          {blockedPermission && (
            <Pressable
              accessibilityRole="button"
              onPress={() => void Linking.openSettings().catch(() => undefined)}
              style={styles.errorAction}>
              <Text style={styles.errorActionText}>Abrir ajustes</Text>
            </Pressable>
          )}
        </View>
      )}

      <Modal
        animationType="slide"
        onRequestClose={() => setIsCameraVisible(false)}
        transparent={false}
        visible={isCameraVisible}>
        <View style={styles.cameraScreen}>
          <CameraView
            ref={cameraRef}
            facing="back"
            onCameraReady={() => setIsCameraReady(true)}
            style={styles.camera}
          />
          <View style={styles.cameraActions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsCameraVisible(false)}
              style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={!isCameraReady || isCapturing}
              onPress={() => void handleCapture()}
              style={[styles.captureButton, (!isCameraReady || isCapturing) && styles.disabledButton]}>
              <Text style={styles.captureText}>{isCapturing ? 'Guardando…' : 'Tomar foto'}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderColor: colors.mist,
    borderTopWidth: 1,
    marginTop: 20,
    paddingTop: 18,
  },
  title: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  permissionStatus: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    borderColor: colors.green,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  actionText: {
    color: colors.forest,
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
  preview: {
    borderRadius: 10,
    height: 120,
    marginTop: 12,
    width: 120,
  },
  status: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  removeButton: {
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  removeText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '800',
  },
  errorBox: {
    backgroundColor: colors.errorSurface,
    marginTop: 10,
    padding: 10,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    lineHeight: 18,
  },
  errorAction: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  errorActionText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '800',
  },
  cameraScreen: {
    backgroundColor: '#000000',
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraActions: {
    alignItems: 'center',
    backgroundColor: '#000000',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    padding: 20,
  },
  cancelButton: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  cancelText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  captureButton: {
    alignItems: 'center',
    backgroundColor: colors.green,
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 18,
  },
  captureText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

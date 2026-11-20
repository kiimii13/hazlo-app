import type { Task } from '@/lib/tasks';

export type TaskAttachmentValues = Pick<Task, 'photoUri' | 'latitude' | 'longitude'>;

type TaskCaptureProps = {
  disabled: boolean;
  value: TaskAttachmentValues;
  onChange: (value: TaskAttachmentValues) => void;
};

export function TaskCapture(_props: TaskCaptureProps) {
  return null;
}

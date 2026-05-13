import { Metadata } from 'next';
import EditorLayout from '@/components/editor/EditorLayout';

export const metadata: Metadata = {
  title: 'Editor — MockupForge',
};

export default function EditorPage() {
  return <EditorLayout />;
}

import { redirect } from 'next/navigation';

export default function ProtectedHome() {
  redirect('/forgewind-engine');
}

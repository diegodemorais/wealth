import { redirect } from 'next/navigation';

// Simulators tab was merged into /assumptions (TOOLS) in the 7-tab reorganization
export default function SimulatorsPage() {
  redirect('/assumptions');
}

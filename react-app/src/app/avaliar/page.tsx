'use client';

import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { AvaliarTab } from '@/components/dashboard/AvaliarTab';

export default function AvaliarPage() {
  return (
    <div>
      <h1>🔍 AVALIAR</h1>

      <CollapsibleSection id="section-audit" title="Component CSS Refactoring Audit" defaultOpen={true}>
        <AvaliarTab />
      </CollapsibleSection>
    </div>
  );
}

'use client';

import { RouteError } from '@/components/primitives/RouteError';

export default function Error(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError {...props} routeLabel="FIRE" />;
}

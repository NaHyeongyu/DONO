// Server component wrapper for client Home

import { Suspense } from "react";
import HomeClient from "./HomeClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Server-only page. Client logic is in HomeClient.tsx

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeClient />
    </Suspense>
  );
}

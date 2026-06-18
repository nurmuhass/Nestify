// components/OfflineGate.tsx

import React from "react";

import OfflineScreen from "@/components/OfflineScreen";
import { useNetwork } from "@/NetworkContext";

export default function OfflineGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOnline, isChecking } = useNetwork();

  if (isChecking) {
    return <OfflineScreen checking />;
  }

  if (!isOnline) {
    return <OfflineScreen />;
  }

  return <>{children}</>;
}
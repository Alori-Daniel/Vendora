import { QueryClientProvider } from "@tanstack/react-query";
import React, { type ReactNode } from "react";

import { queryClient } from "@/lib/query-client";
import { AppBootstrap } from "@/providers/app-bootstrap";
import { KeyboardProvider } from "react-native-keyboard-controller";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppBootstrap />
      <KeyboardProvider preload={false}>{children}</KeyboardProvider>
    </QueryClientProvider>
  );
}

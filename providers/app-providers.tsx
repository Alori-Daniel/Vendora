import { QueryClientProvider } from "@tanstack/react-query";
import React, { type ReactNode } from "react";

import { queryClient } from "@/lib/query-client";
import { AppBootstrap } from "@/providers/app-bootstrap";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppBootstrap />
      {children}
    </QueryClientProvider>
  );
}

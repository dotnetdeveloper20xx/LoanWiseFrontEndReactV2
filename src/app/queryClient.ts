import { QueryClient } from "@tanstack/react-query";

// Create a single shared QueryClient instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // don’t spam API when user switches tabs
      retry: 1, // retry once on failure
      staleTime: 60 * 1000, // cache data as "fresh" for 1 min
    },
    mutations: {
      retry: 0, // don’t auto-retry mutations
    },
  },
});

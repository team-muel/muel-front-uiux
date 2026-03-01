declare global {
  interface Window {
    __MUEL_BENCHMARK__?: {
      getEvents: () => Array<{
        id: string;
        name: string;
        payload?: Record<string, string | number | boolean | null | undefined>;
        ts: string;
        path: string;
      }>;
      getPendingEvents: () => Array<{
        id: string;
        name: string;
        payload?: Record<string, string | number | boolean | null | undefined>;
        ts: string;
        path: string;
      }>;
      clearEvents: () => void;
    };
  }
}

export {};

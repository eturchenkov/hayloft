declare global {
  namespace App {
    type Store = {
      tabs: Tab[];
      sessions: Core.Session[];
      sessionSelecting: {
        tabId: string;
      };
      live: boolean;
    };
    type Tab = {
      id: string;
      mode: "idle" | "session" | "query";
      sessionId: number;
      events: Raw.Event[];
      records: Core.Record[];
      eagerMode: boolean;
    };
  }
}

export {};

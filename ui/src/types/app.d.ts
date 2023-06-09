declare global {
  namespace App {
    type Store = {
      tabs: Tab[];
      sessions: Core.Session[];
      sessionSelecting: {
        tabId: string;
      };
    };
    type Tab = {
      id: string;
      mode: "idle" | "session";
      sessionId: number;
      events: Core.Event[];
    };
  }
}

export {};

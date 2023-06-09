declare global {
  namespace Raw {
    type Session = {
      id: number;
      name: string;
      created_at: number;
    };
    type Event = {
      id: number;
      title: string;
      message: string;
      type: "info" | "prompt" | "response";
      session_id: number;
    };
    type StreamObj = {
      session: Session | null;
      event: Event | null;
    };
  }
}

export {};

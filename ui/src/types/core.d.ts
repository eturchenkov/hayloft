declare global {
  namespace Core {
    type Session = {
      id: number;
      name: string;
      createdAt: Date;
    };
    type Event = {
      id: number;
      title: string;
      message: string;
      type: "info" | "error" | "prompt" | "completion";
      folded: boolean;
    };
  }
}

export {};

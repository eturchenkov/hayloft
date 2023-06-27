declare global {
  namespace Core {
    type Session = {
      id: number;
      name: string;
      createdAt: Date;
    };
    type Record = {
      indexes: number[];
      folded: boolean;
    };
  }
}

export {};

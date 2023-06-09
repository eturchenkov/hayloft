import { agent } from "./agent";

export const service = {
  getSessions: () => agent("GET", "/sessions") as Promise<Raw.Session[]>,
  removeSession: () => agent("DELETE", "/sessions"),
  getEvents: (sessionId: number) =>
    agent("GET", `/sessions/${sessionId}/events`) as Promise<Raw.Event[]>,
};

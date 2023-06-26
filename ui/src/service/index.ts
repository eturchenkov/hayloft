import { agent } from "./agent";

export const service = {
  getSessions: () =>
    agent("GET", "/sessions") as Promise<{ sessions: Raw.Session[] }>,
  updateSession: (id: number, body: { name: string }) =>
    agent("PUT", `/sessions/${id}`, body) as Promise<Raw.Session>,
  removeSession: (id: number) =>
    agent("DELETE", `/sessions/${id}`) as Promise<{ id: number }>,
  getEvents: (sessionId: number) =>
    agent("GET", `/sessions/${sessionId}/events`) as Promise<{
      events: Raw.Event[];
    }>,
};

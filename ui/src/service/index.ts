import { agent } from "./agent";

export const service = {
  getSessions: () =>
    agent("GET", "/sessions") as Promise<{ sessions: Raw.Session[] }>,
  getEvents: (sessionId: number) =>
    agent("GET", `/sessions/${sessionId}/events`) as Promise<{
      events: Raw.Event[];
    }>,
};

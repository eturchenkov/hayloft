import { agent } from "./agent";

export const service = {
  checkLive: () => agent("GET", "/live/check") as Promise<{ started: boolean }>,
  startSession: (body: {
    session: string;
    type: "query";
    title: string;
    message: string;
    tabId: string;
  }) => agent("POST", "/event", body) as Promise<{ success: boolean }>,
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

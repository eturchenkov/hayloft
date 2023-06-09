import { nanoid } from "nanoid";

export const setSessions =
  (rawSessions: Raw.Session[]) =>
  (store: App.Store): App.Store => ({
    ...store,
    sessions: rawSessions.reverse().map((session) => ({
      ...session,
      createdAt: new Date(session.created_at),
    })),
  });

export const addSession =
  (rawSession: Raw.Session) =>
  (store: App.Store): App.Store => ({
    ...store,
    sessions: [
      { ...rawSession, createdAt: new Date(rawSession.created_at) },
      ...store.sessions,
    ],
  });

export const setEvents =
  (sessionId: number, events: Raw.Event[]) =>
  (store: App.Store): App.Store => ({
    ...store,
    tabs: store.tabs.map((tab) =>
      tab.sessionId === sessionId
        ? {
            ...tab,
            events: events
              .reverse()
              .map((event) => ({ ...event, folded: true })),
          }
        : tab
    ),
  });

export const addEvent =
  (event: Raw.Event) =>
  (store: App.Store): App.Store => ({
    ...store,
    tabs: store.tabs.map((tab) =>
      tab.sessionId === event.session_id
        ? {
            ...tab,
            events: [{ ...event, folded: true }, ...tab.events],
          }
        : tab
    ),
  });

export const openModal =
  (tabId: string) =>
  (store: App.Store): App.Store => ({
    ...store,
    sessionSelecting: { tabId },
  });

export const closeModal = (store: App.Store): App.Store => ({
  ...store,
  sessionSelecting: { tabId: "" },
});

export const selectSession =
  (sessionId: number) =>
  (store: App.Store): App.Store => ({
    ...store,
    tabs: store.tabs.map((tab) =>
      tab.id === store.sessionSelecting.tabId
        ? { ...tab, mode: "session", sessionId }
        : tab
    ),
    sessionSelecting: { tabId: "" },
  });

export const addTab = (store: App.Store): App.Store => ({
  ...store,
  tabs: [
    ...store.tabs,
    { id: nanoid(), mode: "idle", sessionId: 0, events: [] },
  ],
});

export const removeTab =
  (tabId: string) =>
  (store: App.Store): App.Store => ({
    ...store,
    tabs:
      store.tabs.length === 1
        ? [{ id: nanoid(), mode: "idle", sessionId: 0, events: [] }]
        : store.tabs.filter((tab) => tab.id !== tabId),
  });

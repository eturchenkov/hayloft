import * as R from "remeda";
import { nanoid } from "nanoid";

export const setSessions =
  (rawSessions: Raw.Session[]) =>
  (store: App.Store): App.Store => ({
    ...store,
    sessions: rawSessions
      .sort((a, b) => b.id - a.id)
      .map((session) => ({
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

export const updateSession =
  (rawSession: Raw.Session) =>
  (store: App.Store): App.Store => ({
    ...store,
    sessions: store.sessions.map((session) =>
      session.id === rawSession.id
        ? { ...session, name: rawSession.name }
        : session
    ),
  });

export const removeSession =
  (sessionId: number) =>
  (store: App.Store): App.Store => ({
    ...store,
    sessions: store.sessions.filter((session) => session.id !== sessionId),
    tabs: R.pipe(
      store.tabs,
      R.filter((tab) => tab.sessionId !== sessionId),
      (tabs) =>
        tabs.length === 0
          ? [{ id: nanoid(), mode: "idle", sessionId: 0, events: [] }]
          : tabs
    ),
  });

export const setEvents =
  (sessionId: number, events: Raw.Event[]) =>
  (store: App.Store): App.Store => ({
    ...store,
    tabs: store.tabs.map((tab) =>
      tab.sessionId === sessionId && tab.events.length === 0
        ? {
            ...tab,
            events: events
              .sort((a, b) => b.id - a.id)
              .map((event) => ({
                ...event,
                folded: true,
                message: trimMessage(event.message),
              }))
              .reduce<Core.Event[]>((acc, event, i) => {
                if (i === 0) {
                  return [event];
                } else {
                  let prevEvent = acc[acc.length - 1];
                  if (
                    prevEvent.title === event.title &&
                    event.message.length < 1000 &&
                    event.type === "info"
                  ) {
                    acc[acc.length - 1] = {
                      ...prevEvent,
                      message: `${prevEvent.message}\n${event.message}`,
                    };
                    return acc;
                  } else {
                    return [...acc, event];
                  }
                }
              }, []),
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
            events:
              tab.events.length > 0 &&
              tab.events[0].title === event.title &&
              event.message.length < 1000 &&
              event.type === "info"
                ? tab.events.map((evt, i) =>
                    i === 0
                      ? {
                          ...evt,
                          message: `${evt.message}\n${trimMessage(
                            event.message
                          )}`,
                        }
                      : evt
                  )
                : [
                    {
                      ...event,
                      folded: false,
                      message: trimMessage(event.message),
                    },
                    ...tab.events,
                  ],
          }
        : tab
    ),
  });

export const toggleFold =
  (tabId: string, eventId: number) =>
  (store: App.Store): App.Store => ({
    ...store,
    tabs: store.tabs.map((tab) =>
      tab.id === tabId
        ? {
            ...tab,
            events: tab.events.map((event) =>
              event.id === eventId ? { ...event, folded: !event.folded } : event
            ),
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

const trimMessage = (message: string): string =>
  message.replace(/^[\n]+/, "").replace(/[\n]+$/, "");

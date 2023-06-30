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
      (tabs) => (tabs.length === 0 ? [buildEmptyTab()] : tabs)
    ),
  });

export const setEvents =
  (sessionId: number, events: Raw.Event[]) =>
  (store: App.Store): App.Store => {
    const nextEvents = events
      .map((event) => ({
        ...event,
        message: trimMessage(event.message),
      }))
      .sort((a, b) => a.id - b.id);
    return {
      ...store,
      tabs: store.tabs.map((tab) =>
        tab.sessionId === sessionId && tab.events.length === 0
          ? {
              ...tab,
              events: nextEvents,
              records: buildRecords(nextEvents, tab.eagerMode),
            }
          : tab
      ),
    };
  };

export const addEvent =
  (event: Raw.Event) =>
  (store: App.Store): App.Store => {
    const nextEvent = {
      ...event,
      message: trimMessage(event.message),
    };
    return {
      ...store,
      tabs: store.tabs.map((tab) =>
        tab.sessionId === event.session_id
          ? {
              ...tab,
              events: [...tab.events, nextEvent],
              records: upsertRecord(nextEvent, tab),
            }
          : tab
      ),
    };
  };

export const toggleFold =
  (tabId: string, recordId: number) =>
  (store: App.Store): App.Store => ({
    ...store,
    tabs: store.tabs.map((tab) =>
      tab.id === tabId
        ? {
            ...tab,
            records: tab.records.map((r, i) =>
              i === recordId ? { ...r, folded: !r.folded } : r
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
  tabs: [...store.tabs, buildEmptyTab()],
});

export const setTabMode =
  (tabId: string, mode: App.Tab["mode"]) =>
  (store: App.Store): App.Store => ({
    ...store,
    tabs: store.tabs.map((tab) => (tab.id === tabId ? { ...tab, mode } : tab)),
  });

export const toggleEagerMode =
  (tabId: string) =>
  (store: App.Store): App.Store => ({
    ...store,
    tabs: store.tabs.map((tab) =>
      tab.id === tabId
        ? {
            ...tab,
            records: buildRecords(tab.events, !tab.eagerMode),
            eagerMode: !tab.eagerMode,
          }
        : tab
    ),
  });

export const removeTab =
  (tabId: string) =>
  (store: App.Store): App.Store => ({
    ...store,
    tabs:
      store.tabs.length === 1
        ? [buildEmptyTab()]
        : store.tabs.filter((tab) => tab.id !== tabId),
  });

const buildEmptyTab = (): App.Tab => ({
  id: nanoid(),
  mode: "idle",
  sessionId: 0,
  events: [],
  records: [],
  eagerMode: true,
});

const trimMessage = (message: string): string =>
  message.replace(/^[\n]+/, "").replace(/[\n]+$/, "");

const upsertRecord = (event: Raw.Event, tab: App.Tab): Core.Record[] => {
  if (
    tab.eagerMode &&
    tab.events.length > 0 &&
    tab.events[tab.events.length - 1].title === event.title &&
    event.message.length < 1000 &&
    tab.events[tab.events.length - 1].type === "info" &&
    event.type === "info"
  ) {
    return tab.records.map((record, i) =>
      i === 0
        ? { indexes: [tab.events.length, ...record.indexes], folded: false }
        : record
    );
  } else {
    return [{ indexes: [tab.events.length], folded: false }, ...tab.records];
  }
};

const buildRecords = (events: Raw.Event[], eagerMode: boolean): Core.Record[] =>
  eagerMode
    ? events.reduceRight<Core.Record[]>((acc, event, i) => {
        if (i === events.length - 1) {
          return [{ indexes: [i], folded: true }];
        } else {
          let prevEvent = events[i + 1];
          if (
            prevEvent.title === event.title &&
            prevEvent.message.length < 1000 &&
            prevEvent.type === "info" &&
            event.type === "info"
          ) {
            let prevReport = acc[acc.length - 1];
            acc[acc.length - 1] = {
              indexes: [...prevReport.indexes, i],
              folded: true,
            };
            return acc;
          } else {
            return [...acc, { indexes: [i], folded: true }];
          }
        }
      }, [])
    : events.map((_, i) => ({ indexes: [i], folded: true })).reverse();

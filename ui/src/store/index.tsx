import { useState, useContext, createContext } from "react";
import { nanoid } from "nanoid";
import type { FC, ReactElement, Dispatch, SetStateAction } from "react";

export const StoreContext = createContext<ContextType | null>(null);

export const StoreProvider: FC<{ children: ReactElement }> = ({ children }) => {
  const [store, mutateStore] = useState<App.Store>({
    tabs: [
      {
        id: nanoid(),
        mode: "idle",
        sessionId: 0,
        events: [],
        records: [],
        eagerMode: true,
      },
    ],
    sessionSelecting: { tabId: "" },
    sessions: [],
  });

  return (
    <StoreContext.Provider value={{ store, mutateStore }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext) as ContextType;

export type ContextType = {
  store: App.Store;
  mutateStore: Dispatch<SetStateAction<App.Store>>;
};

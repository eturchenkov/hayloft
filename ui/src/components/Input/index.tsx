import { useState } from "react";
import { nanoid } from "nanoid";
import { useStore } from "@/store";
import { service } from "@/service";
import * as M from "@/store/mutations";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";

export const Input: FC<{ tabIndex: number }> = ({ tabIndex }) => {
  const { store, mutateStore } = useStore();
  const [query, setQuery] = useState<string>("");
  const tab = store.tabs[tabIndex];

  const startSession = () =>
    service
      .startSession({
        session: `session-${nanoid(6)}`,
        type: "query",
        title: "Initial query",
        message: query,
        tabId: tab.id,
      })
      .then(({ success }) => !success && mutateStore(M.setLiveStatus(false)));

  return store.live ? (
    <div className="relative">
      <textarea
        className="textarea w-full pr-10 border border-slate-700 rounded-2xl text-base focus:outline-0"
        placeholder="type your query..."
        rows={3}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            startSession();
          }
        }}
      ></textarea>
      {query.length > 0 && (
        <PaperAirplaneIcon
          className="absolute top-2.5 right-2 h-6 w-6 text-gray-500 hover:text-gray-200 cursor-pointer"
          onClick={startSession}
        />
      )}
    </div>
  ) : (
    <p className="text-center text-gray-500">Live server haven't started...</p>
  );
};

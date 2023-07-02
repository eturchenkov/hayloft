import { useState } from "react";
import { nanoid } from "nanoid";
import { useStore } from "@/store";
import { service } from "@/service";
import * as M from "@/store/mutations";
import type { FC } from "react";

export const Input: FC<{ tabIndex: number }> = ({ tabIndex }) => {
  const { store, mutateStore } = useStore();
  const [query, setQuery] = useState<string>("");
  const tab = store.tabs[tabIndex];
  return (
    <textarea
      className="textarea w-full border border-slate-700 rounded-2xl text-base focus:outline-0"
      placeholder="type your query..."
      rows={3}
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey && store.live) {
          service
            .startSession({
              session: `session-${nanoid(6)}`,
              type: "query",
              title: "Initial query",
              message: query,
              tabId: tab.id,
            })
            .then(
              ({ success }) => !success && mutateStore(M.setLiveStatus(false))
            );
          console.log(JSON.stringify({ query }));
        }
      }}
    ></textarea>
  );
};

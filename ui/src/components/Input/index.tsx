import { useState } from "react";
import type { FC } from "react";

export const Input: FC<{ tabIndex: number }> = ({ tabIndex }) => {
  const [query, setQuery] = useState<string>("");
  return (
    <textarea
      className="textarea w-full border border-slate-700 rounded-2xl text-base focus:outline-0"
      placeholder="type your query..."
      rows={3}
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          console.log(JSON.stringify({ query }));
        }
      }}
    ></textarea>
  );
};

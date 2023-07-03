import { useMemo } from "react";
import { useStore } from "@/store";
import cs from "classnames";
import * as M from "@/store/mutations";
import type { FC } from "react";

export const RecordList: FC<{ tabIndex: number }> = ({ tabIndex }) => {
  const { store, mutateStore } = useStore();
  const tab = store.tabs[tabIndex];
  const records = useMemo(
    () =>
      tab.records.map((r) => ({
        folded: r.folded,
        title: tab.events[r.indexes[0]].title,
        type: tab.events[r.indexes[0]].type,
        message: r.indexes.map((i) => tab.events[i].message).join("\n"),
      })),
    [tab.records]
  );

  return (
    <>
      {records.map((record, i) => (
        <div
          key={i}
          className={cs("card p-0 mb-4 border", {
            "cursor-pointer border-slate-700 hover:border-slate-400":
              record.folded,
            "border-slate-400": !record.folded,
          })}
          onClick={() => record.folded && mutateStore(M.toggleFold(tab.id, i))}
        >
          <div className="card-body px-4 py-3">
            <h3
              className={cs("card-title text-lg", {
                "text-gray-500": record.folded,
                "text-gray-300 cursor-pointer": !record.folded,
              })}
              onClick={(e) => {
                !record.folded && mutateStore(M.toggleFold(tab.id, i));
                e.preventDefault();
              }}
            >
              {`${records.length - i}. ${record.title}`}{" "}
              <span
                className={cs(
                  "py-0 px-2 text-sm font-normal text-gray-300 rounded-lg",
                  {
                    "bg-pink-900": record.type === "query",
                    "bg-cyan-900": record.type === "info",
                    "bg-rose-900": record.type === "error",
                    "bg-fuchsia-900": record.type === "warning",
                    "bg-indigo-900": record.type === "prompt",
                    "bg-orange-900": record.type === "completion",
                  }
                )}
              >
                {record.type}
              </span>
            </h3>
            <p
              className={cs("text-base ", {
                "text-gray-500 line-clamp-2": record.folded,
                "text-gray-400": !record.folded,
              })}
            >
              {record.message.split("\n").map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
            </p>
          </div>
        </div>
      ))}
    </>
  );
};

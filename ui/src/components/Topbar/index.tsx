import { useStore } from "@/store";
import * as M from "@/store/mutations";
import { XMarkIcon, PlusSmallIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";

export const Topbar: FC = () => {
  const { store, mutateStore } = useStore();

  return (
    <div className="w-full bg-base-200 flex">
      {store.tabs.map((tab) => {
        const sessionName =
          store.sessions.find((s) => s.id === tab.sessionId)?.name ?? "";
        const isTabMany =
          store.tabs.length > 1 || store.tabs[0].mode !== "idle";

        switch (tab.mode) {
          case "session":
            return (
              <div key={tab.id} className="flex-1">
                <div className="px-8 py-4 flex space-x-4">
                  {isTabMany && (
                    <p
                      className="flex-none rounded-lg bg-gray-700 cursor-pointer"
                      onClick={() => mutateStore(M.removeTab(tab.id))}
                    >
                      <XMarkIcon className="h-6 w-6 text-gray-500" />
                    </p>
                  )}
                  <span>{sessionName}</span>
                </div>
              </div>
            );
          default:
            return (
              <div key={tab.id} className="flex-1">
                <div className="px-8 py-4 flex space-x-4">
                  {isTabMany && (
                    <p
                      className="flex-none rounded-lg bg-gray-700 cursor-pointer"
                      onClick={() => mutateStore(M.removeTab(tab.id))}
                    >
                      <XMarkIcon className="h-6 w-6 text-gray-500" />
                    </p>
                  )}
                  <p
                    className="flex-none cursor-pointer"
                    onClick={() => mutateStore(M.openModal(tab.id))}
                  >
                    <span className="text-base">Sessions</span>
                    <span className="badge badge-primary badge-sm ml-1">
                      {store.sessions.length}
                    </span>
                  </p>
                </div>
              </div>
            );
        }
      })}
      <div
        key="add-icon"
        className="absolute right-4 top-3 rounded-full bg-gray-700 cursor-pointer"
        onClick={() => mutateStore(M.addTab)}
      >
        <PlusSmallIcon className="h-8 w-8 text-gray-500" />
      </div>
    </div>
  );
};

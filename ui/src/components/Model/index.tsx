import { useState } from "react";
import { useStore } from "@/store";
import { useClickAway } from "@/hooks";
import { format, differenceInSeconds } from "date-fns/esm/fp";
import * as M from "@/store/mutations";
import { service } from "@/service";
import {
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export const Modal = () => {
  const { store, mutateStore } = useStore();
  const ref = useClickAway(() => mutateStore(M.closeModal));
  const [editState, setEditState] = useState<{ id: number; name: string }>({
    id: 0,
    name: "",
  });
  const now = new Date();

  const updateSessionName = () =>
    service
      .updateSession(editState.id, {
        name: editState.name,
      })
      .then((session) => {
        mutateStore(M.updateSession(session));
        setEditState({ id: 0, name: "" });
      });

  return Boolean(store.sessionSelecting.tabId) ? (
    <>
      <div className="w-screen h-screen bg-[#0000004d] absolute left-0 top-0"></div>
      <div
        ref={ref}
        className="w-[32rem] py-4 rounded-2xl left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] absolute bg-base-100 border border-slate-800"
      >
        <h2 className="mb-4 text-lg text-center font-medium">Sessions</h2>
        <div className="max-h-[60vh] px-4 overflow-y-auto">
          <div>
            {store.sessions.map((session) => (
              <div
                key={session.id}
                className="px-4 py-2 select-none rounded-xl text-left flex flex-nowrap hover:bg-base-200 group"
              >
                {editState.id !== session.id ? (
                  <>
                    <div
                      className="grow cursor-pointer"
                      onClick={() => {
                        mutateStore(M.selectSession(session.id));
                        service.getEvents(session.id).then(({ events }) => {
                          mutateStore(M.setEvents(session.id, events));
                        });
                      }}
                    >
                      <div className="flex flex-nowrap">
                        <p className="grow ">{session.name}</p>
                        <p className="flex-none">
                          {differenceInSeconds(session.createdAt)(now) > 15
                            ? dateFormat(session.createdAt)
                            : "now"}
                        </p>
                      </div>
                    </div>
                    <p
                      className="flex-none ml-4 pt-px text-gray-500 cursor-pointer hover:text-gray-200 hidden group-hover:block"
                      onClick={() =>
                        setEditState({ id: session.id, name: session.name })
                      }
                    >
                      <PencilIcon className="h-5 w-5" />
                    </p>
                    <p
                      className="flex-none ml-2 pt-px text-gray-500 cursor-pointer hover:text-gray-200 hidden group-hover:block"
                      onClick={() =>
                        service.removeSession(session.id).then(({ id }) => {
                          mutateStore(M.removeSession(id));
                        })
                      }
                    >
                      <TrashIcon className="h-5 w-5" />
                    </p>
                  </>
                ) : (
                  <>
                    <div className="grow">
                      <input
                        type="text"
                        autoFocus
                        className="w-full bg-transparent text-gray-500 outline-none"
                        value={editState.name}
                        onChange={(e) => {
                          setEditState({ ...editState, name: e.target.value });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            updateSessionName();
                          }
                        }}
                      />
                    </div>
                    <p
                      className="flex-none ml-4 pt-px text-gray-500 cursor-pointer hover:text-gray-200"
                      onClick={updateSessionName}
                    >
                      <CheckIcon className="h-5 w-5" />
                    </p>
                    <p
                      className="flex-none ml-2 pt-px text-gray-500 cursor-pointer hover:text-gray-200"
                      onClick={() => setEditState({ id: 0, name: "" })}
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
          {store.sessions.length === 0 && (
            <p className="text-gray-500 text-center">No sessions yet...</p>
          )}
        </div>
      </div>
    </>
  ) : null;
};

const dateFormat = format("HH:mm:ss MMM d");

import { useStore } from "@/store";
import { useClickAway } from "@/hooks";
import { format } from "date-fns/esm/fp";
import * as M from "@/store/mutations";
import { service } from "@/service";

export const Modal = () => {
  const { store, mutateStore } = useStore();
  const ref = useClickAway(() => mutateStore(M.closeModal));
  const dateFormat = format("HH:mm:ss");

  return Boolean(store.sessionSelecting.tabId) ? (
    <>
      <div className="w-screen h-screen bg-[#0000004d] absolute left-0 top-0"></div>
      <div
        ref={ref}
        className="w-[32rem] max-h-[90%] p-4 rounded-2xl left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] absolute bg-base-100 border border-slate-800 overflow-y-auto"
      >
        <h2 className="mb-4 text-lg font-medium">Sessions</h2>
        {store.sessions.map((session) => (
          <div
            key={session.id}
            className="p-2 rounded-xl text-left flex flex-nowrap cursor-pointer hover:bg-base-200"
            onClick={() => {
              mutateStore(M.selectSession(session.id));
              service.getEvents(session.id).then((events) => {
                mutateStore(M.setEvents(session.id, events));
              });
            }}
          >
            <p className="grow">{session.name}</p>
            <p className="flex-none">{dateFormat(session.createdAt)}</p>
          </div>
        ))}
      </div>
    </>
  ) : null;
};

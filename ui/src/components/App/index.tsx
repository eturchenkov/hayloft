import { useEffect } from "react";
import { service } from "@/service";
import { buildEventSource } from "@/service/agent";
import { useStore } from "@/store";
import { Modal } from "@/components/Model";
import { Topbar } from "@/components/Topbar";
import { Tab } from "@/components/Tab";
import * as M from "@/store/mutations";

let isMounted = false; // check if it needs for prod

export const App = () => {
  const { store, mutateStore } = useStore();

  useEffect(() => {
    if (!isMounted) {
      isMounted = true;
      service
        .getSessions()
        .then(({ sessions }) => mutateStore(M.setSessions(sessions)));
      const source = buildEventSource();
      source.addEventListener("stream", (e) => {
        const streamObj = JSON.parse(e.data) as Raw.StreamObj;
        if (streamObj.session) mutateStore(M.addSession(streamObj.session));
        if (streamObj.event) mutateStore(M.addEvent(streamObj.event));
      });
    }
  }, []);

  return (
    <div className="w-screen h-screen relative">
      <Topbar />
      <div className="w-full h-[calc(100vh-3.5rem)] flex">
        {store.tabs.map((tab, i) => {
          return (
            <div key={tab.id} className="flex-1">
              <div className="h-full text-left flex flex-col space-y-8 overflow-y-auto">
                <Tab tabIndex={i} />
              </div>
            </div>
          );
        })}
      </div>

      <Modal />
    </div>
  );
};

export default App;

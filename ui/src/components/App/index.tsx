import { useEffect } from "react";
import { service } from "@/service";
import { useStore } from "@/store";
import { Modal } from "@/components/Model";
import { Topbar } from "@/components/Topbar";
import * as M from "@/store/mutations";
import "./styles.css";

let isMounted = false; // check if need for prod

export const App = () => {
  const { store, mutateStore } = useStore();

  useEffect(() => {
    if (!isMounted) {
      isMounted = true;
      service
        .getSessions()
        .then((sessions) => mutateStore(M.setSessions(sessions)));
      const source = new EventSource("http://localhost:5000/listen");
      source.addEventListener("stream", (e) => {
        const streamObj = JSON.parse(e.data) as Raw.StreamObj;
        if (streamObj.session) mutateStore(M.addSession(streamObj.session));
        if (streamObj.event) mutateStore(M.addEvent(streamObj.event));
      });
    }
  }, []);

  return (
    <div className="w-screen h-screen overflow-x-hidden overflow-y-auto relative">
      <Topbar />
      <div className="w-full flex">
        {store.tabs.map((tab) => {
          return (
            <div key={tab.id} className="flex-1">
              <div className="p-8 text-left flex flex-col space-y-8">
                {tab.events.map((event, i) => (
                  <div
                    key={event.id}
                    className="card w-1/2 p-0 border border-slate-700 shadow-xl"
                  >
                    <div className="card-body p-6 divide-y divide-slate-700">
                      <h3 className="card-title">{`${tab.events.length - i}. [${
                        event.type
                      }] ${event.title}`}</h3>
                      <p className="pt-4 text-sm">
                        {event.message.split("\n").map((line, i) => (
                          <span key={i}>
                            {line}
                            <br />
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>
                ))}
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

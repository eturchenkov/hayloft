import { useEffect } from "react";
import { service } from "@/service";
import { useStore } from "@/store";
import cs from "classnames";
import { Modal } from "@/components/Model";
import { Topbar } from "@/components/Topbar";
import * as M from "@/store/mutations";

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
    <div className="w-screen h-screen relative">
      <Topbar />
      <div className="w-full h-[calc(100vh-3.5rem)] flex">
        {store.tabs.map((tab) => {
          return (
            <div key={tab.id} className="flex-1">
              <div className="h-full text-left flex flex-col space-y-8 overflow-y-auto">
                <div
                  className={cs("p-4", { "lg:w-1/2": store.tabs.length === 1 })}
                >
                  {tab.events.map((event, i) => (
                    <div
                      key={event.id}
                      className={cs("card p-0 mb-4 border", {
                        "cursor-pointer border-slate-700 hover:border-slate-400":
                          event.folded,
                        "border-slate-400": !event.folded,
                      })}
                      onClick={() =>
                        event.folded &&
                        mutateStore(M.toggleFold(tab.id, event.id))
                      }
                    >
                      <div className="card-body px-4 py-3">
                        <h3
                          className={cs("card-title text-lg", {
                            "text-gray-500": event.folded,
                            "text-gray-300 cursor-pointer": !event.folded,
                          })}
                          onClick={(e) => {
                            !event.folded &&
                              mutateStore(M.toggleFold(tab.id, event.id));
                            e.preventDefault();
                          }}
                        >
                          {`${tab.events.length - i}. ${event.title}`}{" "}
                          <span
                            className={cs(
                              "py-0 px-2 text-sm font-normal text-gray-300 rounded-lg",
                              {
                                "bg-cyan-900": event.type === "info",
                                "bg-indigo-900": event.type === "prompt",
                                "bg-orange-900": event.type === "response",
                              }
                            )}
                          >
                            {event.type}
                          </span>
                        </h3>
                        <p
                          className={cs("text-base ", {
                            "text-gray-500 line-clamp-2": event.folded,
                            "text-gray-400": !event.folded,
                          })}
                        >
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
            </div>
          );
        })}
      </div>

      <Modal />
    </div>
  );
};

export default App;

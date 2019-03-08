import React, { useRef } from "react";
import ReactDOM from "react-dom";

import "./styles.css";

import useTask from "./useTask";
import wait from "./wait";

async function DoTheThing(notice: String = "Done!") {
  await wait(1000);

  return notice;
}

function App() {
  const [task, taskState] = useTask(DoTheThing, { keep: "all" });

  const ref = useRef<ReturnType<typeof task>>();

  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>

      <p>The task has run {taskState.performCount} times</p>

      <button
        onClick={() => {
          const instance = task();

          ref.current = instance;
        }}
      >
        {taskState.isRunning ? "Running..." : "Run the task!"}
      </button>

      <br />

      {ref.current ? ref.current.result : "No result from latest task"}
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

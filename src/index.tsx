import React, { useRef } from "react";
import ReactDOM from "react-dom";

import "./styles.css";

import useTask from "./useTask";
import wait from "./wait";

function* DoTheThing(notice: String = "Done!") {
  yield wait(1000);

  return notice;
}

function App() {
  const [task, taskState] = useTask(DoTheThing, { keep: "last" });

  const ref = useRef<any>();

  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>

      <p>The task has run {taskState.performCount} times</p>

      <button
        onClick={async () => {
          const value = await task();

          ref.current = value;
        }}
      >
        {taskState.isRunning ? "Running..." : "Run the task!"}
      </button>

      <br />

      {ref.current ? ref.current : "No result from latest task"}
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

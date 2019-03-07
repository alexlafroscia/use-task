import React from "react";
import ReactDOM from "react-dom";

import "./styles.css";

import useTask from "./useTask";
import wait from "./wait";

async function DoTheThing() {
  await wait(1000);

  console.count("Did the thing");

  return "Done!";
}

function App() {
  const [task, taskState] = useTask(DoTheThing, { concurrency: "drop" });

  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>

      <p>The task has run {taskState.performCount} times</p>

      <button onClick={() => task()}>
        {taskState.isRunning ? "Running..." : "Run the task!"}
      </button>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

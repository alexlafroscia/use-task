import { Reducer } from "react";
import { KeepValue } from "./index";
import TaskInstance, {
  AnyFunction,
  TaskInstanceState,
  Result
} from "./instance";
import CancellationError from "./cancellation-error";

export type InternalTaskState<F extends AnyFunction> = {
  keep: KeepValue;
  instances: TaskInstance<F>[];
  lastSuccessful?: TaskInstance<F>;
};

interface BaseAction<F extends AnyFunction> {
  type: string;
  instance: TaskInstance<F>;
}

interface Begin<F extends AnyFunction> extends BaseAction<F> {
  type: "BEGIN";
}

interface Complete<F extends AnyFunction> extends BaseAction<F> {
  type: "COMPLETE";
  result: Result<F>;
}

interface Error<F extends AnyFunction> extends BaseAction<F> {
  type: "ERROR";
  error: any;
}

interface Cancel<F extends AnyFunction> extends BaseAction<F> {
  type: "CANCEL";
  error: CancellationError;
}

export type Action<F extends AnyFunction> =
  | Begin<F>
  | Complete<F>
  | Error<F>
  | Cancel<F>;

export type TaskStateReducer<F extends AnyFunction> = Reducer<
  InternalTaskState<F>,
  Action<F>
>;

function updateStateForInstance<F extends AnyFunction>(
  instances: TaskInstance<F>[],
  instanceToUpdate: TaskInstance<F>,
  callback: () => TaskInstanceState<Result<F>>
): TaskInstance<F>[] {
  return instances.map(instance => {
    if (instance === instanceToUpdate) {
      instance.current = callback();
    }

    return instance;
  });
}

const reducer = (state, action: Action<any>) => {
  switch (action.type) {
    case "BEGIN":
      return { ...state, instances: [...state.instances, action.instance] };
    case "COMPLETE":
      return {
        ...state,
        instances: updateStateForInstance(
          state.instances,
          action.instance,
          () => ({
            isComplete: true,
            isRunning: false,
            isCancelled: false,
            result: action.result
          })
        ),
        lastSuccessful: action.instance
      };
    case "ERROR":
      return {
        ...state,
        instances: updateStateForInstance(
          state.instances,
          action.instance,
          () => ({
            isComplete: true,
            isRunning: false,
            isCancelled: false,
            error: action.error
          })
        )
      };
    case "CANCEL":
      return {
        ...state,
        instances: updateStateForInstance(
          state.instances,
          action.instance,
          () => ({
            isComplete: true,
            isRunning: false,
            isCancelled: true,
            error: action.error
          })
        )
      };
    default:
      throw new Error("Unexpected dispatch received");
  }
};

export default reducer;

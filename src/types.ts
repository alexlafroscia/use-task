import TaskInstance from "./instance";

export interface AnyFunction {
  (...args: any[]): any;
}

export interface SignalReceivingFunction {
  (signal: AbortSignal, ...args: any[]): any;
}

export type NonSignalParameters<F extends AnyFunction> = F extends (
  signal: AbortSignal,
  ...rest: infer A
) => any
  ? A
  : Parameters<F>;

export interface Generator extends AnyFunction {
  (...args: any[]): IterableIterator<any>;
}

export type Result<T extends AnyFunction> = T extends Generator
  ? ReturnType<T> extends IterableIterator<infer U>
    ? U
    : never
  : ReturnType<T>;

export type KeepValue = "first" | "last" | "all";

export type TaskState<F extends AnyFunction> = {
  isRunning: boolean;
  performCount: number;
  lastSuccessful?: TaskInstanceState<Result<F>>;
  cancelAll: () => void;
};

export interface TaskInstanceState<T> {
  isRunning: boolean;
  isComplete: boolean;
  isCancelled: boolean;
  result?: T;
  error?: any;
}

export type UseTaskConfig = {
  keep?: KeepValue;
};

export type UseTaskResult<T extends AnyFunction> = [
  (...args: Parameters<T>) => TaskInstance<T>,
  TaskState<T>
];

export type UseTaskWithSignalResult<T extends SignalReceivingFunction> = [
  (...args: NonSignalParameters<T>) => TaskInstance<T>,
  TaskState<T>
];

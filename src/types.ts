import TaskInstance from "./instance";

export interface AnyFunction {
  (...args: any[]): any;
}

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

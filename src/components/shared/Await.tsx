"use client";

import { use } from "react";

interface AwaitProps<T> {
  promise: Promise<T>;
  children: (data: T) => React.ReactNode;
}

export function Await<T>({ promise, children }: AwaitProps<T>) {
  const data = use(promise);
  return <>{children(data)}</>;
}

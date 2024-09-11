import * as React from 'react';
import { Effect, pipe, Stream, Fiber, FiberId, Layer } from 'effect';
import type { IsUnknown } from 'type-fest';
import { v4 as uuidv4 } from 'uuid';
import type { RuntimeContext } from 'common/utils/context';

/*
This hook returns a function that can be called to trigger an effect.
It returns a promise that resolves to the value of the effect.
*/

export function useRuntimeFn<A, E, R, T>(
  context: RuntimeContext<R>,
  fn:
    | ((value: T) => Effect.Effect<A, E, NoInfer<R>>)
    | Effect.Effect<A, E, NoInfer<R>>,
  deps: React.DependencyList = []
) {
  const runtime = React.useContext(context);
  const safeDeps = React.useMemo(() => [...deps, runtime], [...deps, runtime]);
  const emitter = React.useMemo(() => new EventEmitter<T, A>(), safeDeps);
  const stream = React.useMemo(
    () =>
      pipe(
        Stream.fromAsyncIterable(createAsyncIterator(emitter), () => {}),
        Stream.mapEffect(({ data, eventId }) => {
          return pipe(
            Effect.sync(() => (Effect.isEffect(fn) ? fn : fn(data))),
            Effect.andThen(Effect.tap(emitter.resolve(eventId)))
          );
        }),
        Stream.runDrain
      ),
    safeDeps
  );

  useRuntime(context, stream);
  return emitter.emit as IsUnknown<T> extends true
    ? () => Promise<A>
    : (value: T) => Promise<A>;
}

/*
This hook is used to run an effect in a runtime.
It takes a context and an effect and runs the effect in the runtime provided by the context. It is used by useRuntimeFn. Assumes createRuntimeContext is used to create the context, because it expects a Layer when withRuntime is missing.
*/

const noRuntimeMessage = `No runtime available. 
  Did you forget to wrap your component using WithRuntime?
  `;

export const useRuntime = <A, E, R>(
  context: RuntimeContext<R>,
  task: Effect.Effect<A, E, NoInfer<R>>
) => {
  const runtime = React.useContext(context);
  if (Layer.isLayer(runtime)) throw new Error(noRuntimeMessage);

  React.useEffect(() => {
    const f = task.pipe(runtime!.runFork);
    return () => Effect.runSync(f.pipe(Fiber.interruptAsFork(FiberId.none)));
  }, [runtime, task]);
};

export const useRuntimeSync = <A, E, R>(
  context: RuntimeContext<R>,
  task: Effect.Effect<A, E, NoInfer<R>>
) => {
  const runtime = React.useContext(context);
  if (Layer.isLayer(runtime)) throw new Error(noRuntimeMessage);
  const [result] = React.useState(() => runtime!.runSync(task));
  return result;
};

/* 
This is converting push based events to a pull based stream, where the consumer has control through the provided effect.
Every call to the function returned from useRuntimeFn, returns a promise with the value of the associated effect if it succeeds. 
*/

class EventEmitter<T, A> {
  private listeners: Array<(data: T, eventId: string) => void> = [];
  private resolvers: Map<string, (result: A) => void> = new Map();
  private eventQueue: Array<{ data: T; eventId: string }> = [];

  emit = (data: T): Promise<A> => {
    const eventId = uuidv4();
    let resolver: (result: A) => void;
    const promise = new Promise<A>((resolve) => {
      resolver = resolve;
    });
    this.eventQueue.push({ data, eventId });
    this.notifyListeners();
    this.resolvers.set(eventId, resolver!);
    return promise;
  };

  subscribe(listener: (data: T, eventId: string) => void): void {
    this.listeners.push(listener);
    this.notifyListeners();
  }

  private notifyListeners(): void {
    while (this.eventQueue.length > 0 && this.listeners.length > 0) {
      const event = this.eventQueue.shift()!;
      this.listeners.forEach((listener) => listener(event.data, event.eventId));
    }
  }

  resolve(eventId: string) {
    return (result: A) => {
      const resolver = this.resolvers.get(eventId);
      if (resolver) {
        resolver(result);
        this.resolvers.delete(eventId);
      }
    };
  }

  async waitForEvent(): Promise<{ data: T; eventId: string }> {
    if (this.eventQueue.length > 0) {
      return Promise.resolve(this.eventQueue.shift()!);
    }

    return new Promise((resolve) => {
      const oneTimeListener = (data: T, eventId: string) => {
        resolve({ data, eventId });
        this.listeners = this.listeners.filter((l) => l !== oneTimeListener);
      };
      this.subscribe(oneTimeListener);
    });
  }
}

async function* createAsyncIterator<T, A>(
  emitter: EventEmitter<T, A>
): AsyncGenerator<{ data: T; eventId: string }> {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (true) {
    yield await emitter.waitForEvent();
  }
}

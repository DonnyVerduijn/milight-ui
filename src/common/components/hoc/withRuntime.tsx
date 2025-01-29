import * as React from 'react';
import { Layer, ManagedRuntime } from 'effect';
import type { Simplify, IsAny } from 'type-fest';
import { type RuntimeContext } from 'common/utils/context';

/*
This HOC creates a runtime for the context and provides it to the component.
It allows any downstream components to access the runtime using the context.
*/

// TODO: think about assigning a method to the function, to obtain the provided react context objects in the hoc as an array, for testing purposes. We can separate the hoc from the pipe function and export the method as a named export.

type Props = {
  readonly children: React.ReactNode;
};

type InferProps<C> = C extends React.FC<infer P> ? P : never;

type FallbackProps<C, P> =
  IsAny<InferProps<C>> extends false ? InferProps<C> : P;

export function WithRuntime<TTarget, TProps extends Record<string, unknown>>(
  Context: RuntimeContext<TTarget>,
  getSource: (runtime: ManagedRuntime.ManagedRuntime<TTarget, never>) => TProps
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): <C extends React.FC<any>>(
  Component?: C
) => React.FC<Simplify<Omit<FallbackProps<C, Props>, keyof TProps>>>;

export function WithRuntime<TTarget>(
  Context: RuntimeContext<TTarget>,
  getSource?: (runtime: ManagedRuntime.ManagedRuntime<TTarget, never>) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): <C extends React.FC<any>>(
  Component?: C
) => React.FC<Simplify<FallbackProps<C, Props>>>;

// the goal is to have a utility that allows us to reuse the logic between the withRuntime hoc and the Runtime component that takes the runtime as a prop. Later on we might want to consider the Runtime component to be used in JSX in more scenarios, but for now it is limited to usage in storybook decorators

//
export function WithRuntime<TTarget, TProps extends Record<string, unknown>>(
  Context: RuntimeContext<TTarget>,
  getSource?: (runtime: ManagedRuntime.ManagedRuntime<TTarget, never>) => TProps
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <C extends React.FC<any>>(Component?: C) => {
    const Wrapped: React.FC<Simplify<FallbackProps<C, Props>>> = (props) => {
      const { layer } = Context as unknown as {
        layer: Layer.Layer<TTarget>;
      };

      const runtime = useRuntimeFactory(layer);
      const mergedProps = getSource
        ? { ...getSource(runtime), ...props }
        : props;

      const children =
        getComponent(Component, mergedProps) ??
        (props.children as React.ReactNode) ??
        null;

      return <Context.Provider value={runtime}>{children}</Context.Provider>;
    };
    Wrapped.displayName = `WithRuntime(${(Component && (Component.displayName || Component.name)) || 'Component'})`;

    return Wrapped;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getComponent<C extends React.FC<any> | undefined>(
  Component: C,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mergedProps: C extends React.FC<any>
    ? React.ComponentPropsWithRef<C>
    : Record<never, never>
) {
  return Component ? (
    <Component
      {...(mergedProps as React.ComponentPropsWithRef<Exclude<C, undefined>>)}
    />
  ) : null;
}

/*
This hook creates a runtime and disposes it when the component is unmounted.
It is used by withRuntime to create a runtime for the context. 
This is both compatible with strict mode and fast refresh. 🚀
*/

const useRuntimeFactory = <T,>(layer: Layer.Layer<T>) => {
  const disposed = React.useRef(false);
  const [runtime, setRuntime] = React.useState(() =>
    ManagedRuntime.make(layer)
  );

  React.useEffect(() => {
    let current = runtime;
    if (disposed.current) {
      current = ManagedRuntime.make(layer);
      setRuntime(() => current);
      disposed.current = false;
    }

    return () => {
      void current.dispose();
      disposed.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layer]);

  return runtime;
};

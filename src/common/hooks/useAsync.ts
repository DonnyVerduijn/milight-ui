import * as React from 'react';
import { isPlainObject } from 'remeda';

const defaultMerge = <T>(
  current: { merge?: (a: T) => void } | T,
  optimistic: T
) => {
  // we should prevent merging incompatible objects, maybe structural compare
  isPlainObject(current) && current.merge?.(optimistic);
};

export const useAsync = <T>(
  getAsync: () => Promise<T>,
  optimistic: () => T = () => ({}) as T,
  merge: (result: T, current: T) => void = defaultMerge
) => {
  const [error, setError] = React.useState<Error | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [current, setCurrent] = React.useState<T>(optimistic);

  React.useEffect(() => {
    let mounted = true;
    void getAsync().then(
      (result) => {
        if (mounted) {
          merge(result, current);
          setCurrent(result);
          setLoading(false);
        }
      },
      (error: Error) => {
        if (mounted) {
          setError(error);
          setLoading(false);
        }
      }
    );
    return () => {
      mounted = false;
    };
  }, []);

  return { data: current, error, loading };
};

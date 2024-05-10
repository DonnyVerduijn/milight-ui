import React, { useState } from 'react';
import { Call, O, S } from 'hotscript';
import {
  AnnotationsMap,
  observable,
  autorun,
  runInAction,
  reaction,
  IReactionOptions,
  IAutorunOptions,
} from 'mobx';
import { identity, isFunction } from 'remeda';
import { memoize } from 'common/utils/memoize';

export const useMobx = <T extends Record<string, unknown>>(
  initialize: () => T,
  annotations?: AnnotationsMap<T, never>
) =>
  useState(() => {
    const obs = observable(initialize(), annotations, {
      autoBind: true,
    });

    const getKeys = <TPath extends string>(path: TPath) => [
      ...(path.split('.') as Call<S.Split<'.'>, typeof path> & string[]),
    ];

    const getParent = <TParent>(
      observable: Record<string, unknown>,
      keys: string[]
    ): TParent => {
      let target: unknown = observable;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!Object.prototype.hasOwnProperty.call(target, keys[i])) {
          throw new Error('Invalid path');
        }
        // @ts-expect-error target changes so is unknown
        target = target[keys[i]];
      }
      // target contains the parent reference
      return target as TParent;
    };

    type LazyGetFn<TType> = <
      P extends Call<O.AllPaths, TType>,
      V extends Call<O.Get<P>, TType>,
      R,
    >(
      path: P,
      map?: (value: V) => R
    ) => () => R;

    const lazyGet: LazyGetFn<T> = memoize((path, map = identity) => {
      const keys = getKeys(path);
      const parent = getParent<Parameters<typeof map>[0]>(obs, keys);
      const key = keys[keys.length - 1];
      return () => map(parent[key] as Call<O.Get<typeof path>, T>);
    });

    type SetFn<TType> = <
      P extends Call<O.AllPaths, TType>,
      S extends Call<O.Get<P>, TType>,
      V,
    >(
      path: P,
      map?: (value: V, state: S) => S
    ) => (value: V) => void;

    const set: SetFn<T> = memoize(
      // we currently don't typecheck without the map function
      // although it would be great
      (path, map = (value, state) => value as unknown as typeof state) => {
        const keys = getKeys(path);
        const parent = getParent<Parameters<typeof map>[0]>(obs, keys);
        const key = keys[keys.length - 1];

        return (value) =>
          runInAction(() => {
            parent[key] = map(
              value,
              parent[key] as Call<O.Get<typeof path>, T>
            );
          });
      }
    );

    // This is the autobinding part we don't need anymore. Hurray!
    for (const key in obs) {
      if (isFunction(obs[key])) {
        const currentFn = obs[key] as <T>(a: T) => void;
        (obs[key] as <T>(a: T) => void) = <T>(a: T) => {
          currentFn(a);
        };
      }
    }
    return Object.assign(obs, {
      lazyGet,
      set,
    });
  })[0];

export const useAutorun = (fn: () => void, options: IAutorunOptions = {}) =>
  // because the aesthetics of useEffect are suboptimal
  React.useEffect(() => autorun(fn, options), []);

export const useReaction = <T>(
  fn: () => T,
  effect: (value: T, prev: T) => void,
  options: IReactionOptions<T, false> = { delay: 100 }
) => {
  React.useEffect(() => reaction(fn, effect, options), []);
};

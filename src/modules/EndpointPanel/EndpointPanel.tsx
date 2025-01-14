import * as React from 'react';
import { Effect, Queue, flow } from 'effect';
import { observer } from 'mobx-react-lite';
import { Button } from 'common/components/Button/Button';
import { WithRuntime } from 'common/components/hoc/withRuntime';
import { List } from 'common/components/List/List';
import { Stack } from 'common/components/Stack/Stack';
import { useReturn } from 'common/hooks/useReturn';
import {
  useRuntime,
  useRuntimeFn,
  useRuntimeSync,
} from 'common/hooks/useRuntimeFn';
import { useTranslation } from 'common/hooks/useTranslation';
import type { RuntimeType } from 'common/utils/context';
import type { EventType } from 'common/utils/event';
import { memoize } from 'common/utils/memoize';
import { addEndpointRequested } from 'models/endpoint/events';
import { createEndpoint } from 'models/endpoint/model';
import { AppRuntime } from 'modules/App/context';
import * as AppTags from 'modules/App/tags';
import EndpointListItem from './components/EndpointListItem';
import { EndpointPanelRuntime } from './context';
import styles from './EndpointPanel.module.css';
import * as Tags from './tags';

interface Props extends OuterProps, InnerProps {}
interface InnerProps {}
export interface OuterProps {}

export interface Translations {
  addEndpointLabel: string;
}

const registerInboundQueue = memoize(
  (runtime: RuntimeType<typeof EndpointPanelRuntime>) =>
    Effect.gen(function* () {
      const bus = yield* AppTags.EventBus;
      yield* bus.register((event) =>
        runtime.runFork(Effect.andThen(Tags.InboundQueue, Queue.offer(event)))
      );
    })
);

const publishToBus = (msg: EventType<unknown>) =>
  Effect.andThen(AppTags.EventBus, (bus) => bus.publish(msg));

//
const Component = flow(
  observer<Props>,
  WithRuntime(EndpointPanelRuntime, (runtime) => {
    // TODO: Use request/response to avoid stale reads, before dispatching actions
    useRuntime(AppRuntime, registerInboundQueue(runtime), [runtime]);
  })
);

/**
 * This is the main component for the EndpointPanel module.
 * It displays a list of endpoints and allows the user to add new endpoints.
 */
const EndpointPanel = Component(function EndpointPanel() {
  const { addEndpoint, endpoints, publish } = useEndpointPanel();
  const { text } = useTranslation<Translations>();

  const renderList = React.useCallback(
    () =>
      endpoints.map((endpoint) => (
        <EndpointListItem
          key={endpoint.id}
          endpoint={endpoint}
          publish={publish}
        />
      )),
    [endpoints, publish]
  );

  return (
    <Stack className={styles.EndpointPanel}>
      <List render={renderList} />
      <Button onClick={addEndpoint}>
        <React.Suspense fallback='loading...'>
          {text('addEndpointLabel')}
        </React.Suspense>
      </Button>
    </Stack>
  );
});

export default EndpointPanel;

function useEndpointPanel() {
  // TODO: use normalized cache for entity collections and create mobx entity stores inside view models.
  const store = useRuntimeSync(AppRuntime, AppTags.EndpointStore);
  const publish = useRuntimeFn(AppRuntime, publishToBus);

  const endpoints = store.list.get();

  const addEndpoint = React.useCallback(() => {
    void publish(addEndpointRequested(createEndpoint()));
  }, [publish]);

  return useReturn({ addEndpoint, endpoints, publish });
}

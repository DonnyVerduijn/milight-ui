import * as React from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react-lite';
import { MdOutlineDelete } from 'react-icons/md';
import { IconButton } from 'common/components/IconButton/IconButton';
import { Radio } from 'common/components/Radio/Radio';
import { Stack } from 'common/components/Stack/Stack';
import { TextInput } from 'common/components/TextInput/TextInput';
import { useReturn } from 'common/hooks/useReturn';
import { useRuntimeSync } from 'common/hooks/useRuntimeFn';
import type { Publishable } from 'common/utils/event';
import {
  updateEndpointRequested,
  removeEndpointRequested,
  selectEndpointRequested,
} from 'models/endpoint/events';
import type { Endpoint } from 'models/endpoint/model';
import { AppRuntime } from 'modules/App/context';
import * as AppTags from 'modules/App/tags';
import styles from './EndpointListItem.module.css';

export interface Props extends Publishable {
  readonly endpoint: Endpoint;
}

/**
 * This component is responsible for rendering a single endpoint item in the list.
 * It normalizes the behavior of the input across OSes and browsers.
 * It also provides a way to select, update, and remove the endpoint.
 */
const Main = observer(function EndpointListItem(props: Props) {
  const { getChecked, getUrl } = useGetters(props);
  const { updateFn, removeFn, selectFn } = useHandlers(props);
  const classNames = React.useMemo(
    () => ({ root: styles.EndpointListItem }),
    []
  );

  return (
    <Stack
      classNames={classNames}
      component='li'
    >
      <Radio
        getValue={getChecked}
        name={`select_${props.endpoint.id}`}
        onChange={selectFn}
      />
      <TextInput
        className={styles.TextField}
        getValue={getUrl}
        onChange={updateFn}
      />
      <IconButton
        aria-label='delete'
        className={styles.Button}
        onClick={removeFn}
        size='xl'
        variant='subtle'
      >
        <MdOutlineDelete size={28} />
      </IconButton>
    </Stack>
  );
});

export default Main;

//
const useGetters = ({ endpoint }: Props) => {
  const store = useRuntimeSync(AppRuntime, AppTags.EndpointStore);
  //
  const checked = React.useMemo(
    () => computed(() => store.selectedId.get() === endpoint.id),
    [store, endpoint]
  );

  const getChecked = React.useCallback(() => checked.get(), [checked]);
  const getUrl = React.useCallback(() => endpoint.url, [endpoint]);
  return useReturn({ getChecked, getUrl });
};

// TODO: think about delegating events to the parent component, because we currently memoize on a per listitem basis, which is not ideal. We can simply pass the handlers as props from the parent component and memoize them
//
const useHandlers = ({ endpoint, publish }: Props) => {
  //
  const selectFn = React.useCallback(
    () => publish(selectEndpointRequested(endpoint.id)),
    [publish, endpoint]
  );

  const updateFn = React.useCallback(
    (value: string) =>
      // TODO: find out why updates are blocked when holding down keys. Only happens when characters are added, not when removed. Might have to do with how the updated value is passed to the store.

      void publish(updateEndpointRequested({ id: endpoint.id, url: value })),
    [publish, endpoint]
  );

  const removeFn = React.useCallback(
    () => void publish(removeEndpointRequested(endpoint.id)),
    [publish, endpoint]
  );
  return useReturn({ removeFn, selectFn, updateFn });
};

import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { css } from '@mui/material/styles';
import { computed } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Radio } from 'common/components/Radio';
import { Stack } from 'common/components/Stack';
import { TextField } from 'common/components/TextField';
import { useRuntimeSync } from 'common/hooks/useRuntimeFn';
import type { Endpoint } from 'common/models/endpoint/endpoint';
import { updateEndpointRequested } from 'common/models/endpoint/events';
import type { Publishable } from 'common/utils/event';
import { EndpointPanelRuntime, EndpointStore } from '../context';

interface Props extends Publishable {
  readonly endpoint: Endpoint;
}

export const EndpointListItem = observer(EndpointListItem_);

function EndpointListItem_(props: Props) {
  const { getChecked, getUrl } = useGetters(props);
  const { updateFn, removeFn, selectFn } = useActions(props);

  return (
    <Stack css={styles.root}>
      <Radio
        getValue={getChecked}
        name={`select_${props.endpoint.id}`}
        onChange={selectFn}
      />
      <TextField
        css={styles.textField}
        getValue={getUrl}
        onChange={updateFn}
      />
      <IconButton
        aria-label='delete'
        onClick={removeFn}
      >
        <DeleteIcon />
      </IconButton>
    </Stack>
  );
}
// TODO: wrap IconButton in common/components

const useGetters = ({ endpoint }: Props) => {
  const store = useRuntimeSync(EndpointPanelRuntime, EndpointStore);
  const checked = React.useMemo(
    () => computed(() => store.selectedId.get() === endpoint.id),
    [store, endpoint]
  );
  const getChecked = React.useCallback(() => checked.get(), [checked]);
  const getUrl = React.useCallback(() => endpoint.url, [endpoint]);
  return { getChecked, getUrl };
};

const useActions = ({ endpoint, publish }: Props) => {
  const store = useRuntimeSync(EndpointPanelRuntime, EndpointStore);
  const selectFn = React.useCallback(
    () => store.selectById(endpoint.id),
    [store, endpoint]
  );

  // TODO: find out why updates are blocked when holding down keys. Only happens when characters are added, not when removed. Might have to do with how the updated value is passed to the store.

  const updateFn = React.useCallback(
    (value: string) => {
      void publish(
        updateEndpointRequested(
          { id: endpoint.id, url: value },
          { source: 'EndpointListItem' }
        )
      );
    },
    [publish, endpoint]
  );

  const removeFn = React.useCallback(
    () => store.remove(endpoint.id),
    [store, endpoint]
  );

  return { removeFn, selectFn, updateFn };
};

const styles = {
  root: css`
    --label: EndpointListItem;
    display: flex;
    flex-direction: row;
    gap: 1em;
  `,
  textField: css`
    --label: TextField;
    flex: 1;
  `,
};

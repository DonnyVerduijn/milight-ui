import * as React from 'react';
import Switch from '@mui/material/Switch';
import { observer } from 'mobx-react-lite';

interface Props extends DefaultProps {
  readonly getValue: () => boolean;
  readonly name: string;
  readonly onChange: (value: boolean) => void;
}

export const Toggle: React.FC<Props> = observer(function Toggle(props) {
  const { className, getValue, onChange, name } = props;
  //
  const handleChange = React.useCallback<
    (e: React.ChangeEvent<HTMLInputElement>, v: boolean) => void
  >((_, v) => onChange(v), [onChange]);

  return (
    <Switch
      checked={getValue()}
      className={className!}
      color='primary'
      name={name}
      onChange={handleChange}
    />
  );
});

import * as React from 'react';
// import VolumeUp from '@mui/icons-material/VolumeUp';
import type { PropsOf } from '@emotion/react';
import { css } from '@mui/material/styles';
import MuiTextField from '@mui/material/TextField';
import { observer } from 'mobx-react-lite';

interface InputProps<T> extends DefaultProps {
  readonly getValue: () => T;
  readonly onBlur?: () => void;
  readonly onChange: (value: T) => void;
}

export const TextField = observer(function TextField<T>(props: InputProps<T>) {
  const { className, getValue: value, onBlur, onChange } = props;
  //
  const handleBlur = React.useCallback(() => onBlur && onBlur(), [onBlur]);
  const handleInputChange = React.useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((e) => onChange(e.target.value as T), [onChange]);

  const handleWheel = React.useCallback<
    React.WheelEventHandler<HTMLInputElement>
  >(
    (event) => {
      if (!event.deltaY) return;
      const adjustment = event.deltaY < 0 ? 0.1 : -0.1;
      onChange(Number((Number(value()) + adjustment).toFixed(1)) as T);
    },
    [onChange, value]
  );

  const slotProps = React.useMemo(() => {
    return {
      htmlInput: {
        inputMode: 'numeric',
        max: 255,
        min: 0,
        pattern: '[0-9]*',
        step: 1,
        type: 'text',
      },
    } satisfies PropsOf<typeof MuiTextField>['slotProps'];
  }, []);

  return (
    <MuiTextField
      hiddenLabel
      className={className!}
      css={textFieldStyles.root}
      onBlur={handleBlur}
      // onMouseOut={(e) => e.target.blur()} // Optional: Auto-blur when mouse leaves
      // onMouseOver={(e) => e.target.focus()} // Optional: Auto-focus on hover for better UX
      onChange={handleInputChange}
      onWheel={handleWheel}
      size='small'
      slotProps={slotProps}
      value={value()}
      variant='outlined'
    />
  );
});

const textFieldStyles = {
  input: css`
    &:hover {
      background: inherit;
    }
  `,
  root: css`
    background: inherit;
  `,
};

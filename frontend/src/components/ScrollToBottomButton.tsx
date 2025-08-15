import { ActionIcon } from '@mantine/core';
import { IconArrowDown } from '@tabler/icons-react';

export function ScrollToBottomButton({ onClick, style }: { onClick: () => void, style?: React.CSSProperties }) {
  return (
    <ActionIcon
      variant="filled"
      color="red"
      radius="xl"
      size="lg"
      onClick={onClick}
      style={style}
    >
      <IconArrowDown size={20} />
    </ActionIcon>
  );
}

import * as React from 'react';
import { Group } from '@mantine/core';
import { BsClockFill } from 'react-icons/bs';
import { MdFileDownload, MdBookmark } from 'react-icons/md';
import { useStatusStyles } from './status.styles';

export interface Status {
  downloaded: boolean;
  readLater: boolean;
  favorited: boolean;
}

export const StatusIndicators = (props: Status) => {
  const { classes } = useStatusStyles(props);
  return (
    <Group noWrap spacing={10}>
      <MdFileDownload size={16} className={`${classes.base} ${classes.download}`} />
      <BsClockFill size={16} className={`${classes.base} ${classes.later}`} />
      <MdBookmark size={16} className={`${classes.base} ${classes.favorite}`} />
    </Group>
  );
};

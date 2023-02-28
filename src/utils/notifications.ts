import { NotificationProps, showNotification, updateNotification } from '@mantine/notifications';
import { nanoid } from '@reduxjs/toolkit';
import {
  negativeStatusIconMap,
  negativeStatusTextMap,
  positiveStatusIconMap,
  positiveStatusTextMap,
} from 'src/constants/notificationConstants';
import { PostStatus } from 'src/server/routers/post';

const commonProps: Omit<NotificationProps, 'message'> = {
  // autoClose: false
  disallowClose: true,
};

const updateDownloadNotification = (icon: React.ReactNode) =>
  updateNotification({
    id: 'download-status',
    title: 'Download Status',
    message: 'Download Completed',
    icon: icon,
    color: 'green',
    ...commonProps,
  });

const showDownloadNotification = (isLoading: boolean) =>
  showNotification({
    id: 'download-status',
    title: 'Download Status',
    message: 'Downloading',
    loading: isLoading,
    ...commonProps,
  });

const getNotificationStatusTitle = (status: PostStatus) => {
  return status.toString().charAt(0).toUpperCase() + status.toString().slice(1);
};

const showPostStatusNotification = (status: PostStatus, newValue: boolean) =>
  showNotification({
    id: 'post-status-update' + nanoid(),
    title: `${getNotificationStatusTitle(status)}`,
    message: `${newValue === false ? negativeStatusTextMap[status] : positiveStatusTextMap[status]}`,
    icon: newValue === false ? negativeStatusIconMap[status] : positiveStatusIconMap[status],
    color: newValue === false ? 'red' : 'green',
    autoClose: 1500,
    ...commonProps,
  });

const showSigninNotification = (userName?: string | null) =>
  showNotification({
    id: 'sign-in',
    title: 'Signed In',
    message: `Signed in ${userName ? 'as ' + userName + '!' : 'successfully!'} `,
    ...commonProps,
  });

const showSignOutNotification = () =>
  showNotification({
    id: 'sign-out',
    title: 'Sign Out',
    message: 'Signed out successfully!',
    ...commonProps,
  });

const showUnauthenticatedNotification = () =>
  showNotification({
    id: 'unauthenticated',
    title: "Sorry, you can't do that",
    message: 'Create an account or sign in!',
    ...commonProps,
  });

export {
  showDownloadNotification,
  updateDownloadNotification,
  showPostStatusNotification,
  showSignOutNotification,
  showSigninNotification,
  showUnauthenticatedNotification,
};

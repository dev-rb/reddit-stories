import { NotificationProps, showNotification, updateNotification } from "@mantine/notifications";
import { MdCheckCircle } from 'react-icons/md';
import { PostStatus } from "src/server/routers/post";

const commonProps: Omit<NotificationProps, 'message'> = {
    // autoClose: false
    disallowClose: true
}

const updateDownloadNotification = (icon: React.ReactNode) => updateNotification({
    id: 'download-status',
    title: 'Download Status',
    message: 'Download Completed',
    ...commonProps,
    icon: icon,
    color: 'green'
})

const showDownloadNotification = (isLoading: boolean) => showNotification({
    id: 'download-status',
    title: 'Download Status',
    message: 'Downloading',
    ...commonProps,
    loading: isLoading,
})

const showPostStatusNotification = (status: PostStatus) => showNotification({
    id: 'post-status-update',
    message: `${status.toString()}`,
    ...commonProps
})

const showSigninNotification = (userName?: string | null) => showNotification({
    id: 'sign-in',
    title: 'Signed In',
    message: `Signed in ${userName ? 'as ' + userName + '!' : 'successfully!'} `,
    ...commonProps
})

const showSignOutNotification = () => showNotification({
    id: 'sign-out',
    title: 'Sign Out',
    message: 'Signed out successfully!',
    ...commonProps
})

const showUnauthenticatedNotification = () => showNotification({
    id: 'unauthenticated',
    title: 'Sorry, you can\'t do that',
    message: 'Create an account or sign in!',
    ...commonProps
})

export {
    showDownloadNotification,
    updateDownloadNotification,
    showPostStatusNotification,
    showSignOutNotification,
    showSigninNotification,
    showUnauthenticatedNotification
}
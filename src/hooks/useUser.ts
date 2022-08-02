import { useDidUpdate } from "@mantine/hooks";
import { useSession } from "next-auth/react"
import { showSigninNotification } from "src/utils/notifications";

export const useUser = () => {
    const session = useSession();
    const userInfo = session.data?.user;

    useDidUpdate(() => {
        if (session.status === 'authenticated') {
            showSigninNotification(userInfo?.name ?? userInfo?.email?.split('@')[0]);
        }
    }, [session.status])

    return { userId: userInfo?.id, name: userInfo?.name, email: userInfo?.email, isAuthenticated: session.status === 'authenticated' }
}
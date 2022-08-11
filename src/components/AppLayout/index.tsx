import { useRouter } from "next/router";
import React from "react";
import BottomNavigationBar from "../BottomNavigationBar";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
    const [hasMounted, setHasMounted] = React.useState(false);

    const router = useRouter();
    React.useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) return null

    // console.log(router.pathname)

    return (
        <>
            <main> {children} </main>
            {router.pathname !== '/signin' && <BottomNavigationBar />}
        </>
    );
}

export default AppLayout;
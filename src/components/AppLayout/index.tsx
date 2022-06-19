import React from "react";
import BottomNavigationBar from "../BottomNavigationBar";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
    const [hasMounted, setHasMounted] = React.useState(false);

    React.useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) return null

    return (
        <>
            <main> {children} </main>
            <BottomNavigationBar />
        </>
    );
}

export default AppLayout;
import {Outlet} from "react-router-dom";
import {SimpleNavbar} from "@/components/simple-navbar";

export function AdminLayout() {
    return (
        <div className="min-h-screen bg-background">
            <SimpleNavbar showAuth={true}/>

            {/* Main content area with padding for navbar */}
            <main className="pt-16 min-h-screen">
                <Outlet/>
            </main>
        </div>
    );
}
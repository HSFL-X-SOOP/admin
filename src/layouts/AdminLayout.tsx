import {Outlet} from "react-router-dom";
import {SimpleNavbar} from "@/components/simple-navbar";

export function AdminLayout() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <SimpleNavbar showAuth={true}/>

            <main className="pt-16 min-h-screen">
                <Outlet/>
            </main>
        </div>
    );
}
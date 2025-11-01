import {Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuItem, NavbarMenuToggle} from "@heroui/navbar";
import {ThemeSwitch} from "@/components/theme-switch";
import {Logo} from "@/components/icons.tsx";
import {Button} from "@heroui/button";
import {Link} from "@heroui/link";
import {useAuth} from "@/hooks/useAuth";
import {useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";

interface SimpleNavbarProps {
    showAuth?: boolean;
}

export const SimpleNavbar = ({ showAuth = false }: SimpleNavbarProps) => {
    const {logout, session} = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        {label: "Dashboard", href: "/"},
        {label: "Sensors", href: "/sensors"},
        {label: "Users", href: "/users"},
        {label: "Settings", href: "/settings"},
    ];

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <Navbar
            isBordered
            isMenuOpen={isMenuOpen}
            onMenuOpenChange={setIsMenuOpen}
            className="fixed top-0"
            maxWidth="full"
        >
            <NavbarContent>
                {showAuth && (
                    <NavbarMenuToggle
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                        className="sm:hidden"
                    />
                )}
                <NavbarBrand className="gap-3">
                    <div className="mr-3 flex items-center justify-center">
                        <Logo className={"text-secondary dark:text-primary"} size={showAuth ? 40 : 60}/>
                    </div>
                    <p className="font-bold text-inherit">Marlin Admin</p>
                </NavbarBrand>
            </NavbarContent>

            {showAuth && (
                <NavbarContent className="hidden sm:flex gap-6" justify="center">
                    {menuItems.map((item) => (
                        <NavbarItem key={item.href} isActive={location.pathname === item.href}>
                            <Link
                                color={location.pathname === item.href ? "primary" : "foreground"}
                                href={item.href}
                                size="sm"
                                className="font-medium"
                            >
                                {item.label}
                            </Link>
                        </NavbarItem>
                    ))}
                </NavbarContent>
            )}

            <NavbarContent justify="end">
                {showAuth && session && (
                    <>
                        <NavbarItem className="hidden sm:flex items-center gap-2">
                            <span className="text-sm text-default-500">
                                {session.role}
                            </span>
                        </NavbarItem>
                        <NavbarItem>
                            <Button
                                color="danger"
                                variant="flat"
                                size="sm"
                                onPress={handleLogout}
                            >
                                Logout
                            </Button>
                        </NavbarItem>
                    </>
                )}
                <ThemeSwitch/>
            </NavbarContent>

            {showAuth && (
                <NavbarMenu>
                    {menuItems.map((item, index) => (
                        <NavbarMenuItem key={`${item.label}-${index}`}>
                            <Link
                                className="w-full"
                                color={location.pathname === item.href ? "primary" : "foreground"}
                                href={item.href}
                                size="lg"
                            >
                                {item.label}
                            </Link>
                        </NavbarMenuItem>
                    ))}
                    <NavbarMenuItem>
                        <Button
                            className="w-full mt-4"
                            color="danger"
                            variant="flat"
                            onPress={handleLogout}
                        >
                            Logout
                        </Button>
                    </NavbarMenuItem>
                </NavbarMenu>
            )}
        </Navbar>
    );
};

import {useState} from "react";
import {Card, CardBody, CardHeader, CardFooter} from "@heroui/card";
import {Input} from "@heroui/input";
import {Button} from "@heroui/button";
import {Link} from "@heroui/link";
import {Checkbox} from "@heroui/checkbox";
import {Divider} from "@heroui/divider";
import {EyeFilledIcon, EyeSlashFilledIcon, Logo} from "@/components/icons";
import {SimpleNavbar} from "@/components/simple-navbar";
import {useAuth} from "@/hooks/useAuth";

export default function LoginPage() {
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    const {login, isLoading} = useAuth();

    const toggleVisibility = () => setIsVisible(!isVisible);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        await login({
            email,
            password,
            rememberMe
        });
    };

    return (
        <>
            <SimpleNavbar showAuth={false}/>
            <div
                className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 pt-16">
                <Card className="max-w-md w-full mx-4">
                    <CardHeader className="flex flex-col gap-3 pt-8 px-8">
                        <div className="flex justify-center mb-4">
                            <Logo size={50} className="text-secondary dark:text-primary"/>
                        </div>
                        <div className="text-center">
                            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                            <p className="text-sm text-default-500 mt-1">
                                Sign in to access the admin panel
                            </p>
                        </div>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardBody className="px-8 py-6 gap-4">
                            <Input
                                autoFocus
                                label="Email"
                                placeholder="admin@marlin-live.com"
                                variant="bordered"
                                type="email"
                                value={email}
                                onValueChange={setEmail}
                                isRequired
                                classNames={{
                                    label: "text-black/50 dark:text-white/90",
                                }}
                            />

                            <Input
                                label="Password"
                                variant="bordered"
                                placeholder="Enter your password"
                                value={password}
                                onValueChange={setPassword}
                                isRequired
                                endContent={
                                    <button
                                        className="focus:outline-none"
                                        type="button"
                                        onClick={toggleVisibility}
                                        aria-label="toggle password visibility"
                                    >
                                        {isVisible ? (
                                            <EyeSlashFilledIcon
                                                className="text-2xl text-default-400 pointer-events-none"/>
                                        ) : (
                                            <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none"/>
                                        )}
                                    </button>
                                }
                                type={isVisible ? "text" : "password"}
                                classNames={{
                                    label: "text-black/50 dark:text-white/90",
                                }}
                            />

                            <div className="flex justify-start items-center py-2">
                                <Checkbox
                                    size="sm"
                                    isSelected={rememberMe}
                                    onValueChange={setRememberMe}
                                >
                                    Remember me
                                </Checkbox>
                            </div>
                        </CardBody>

                        <CardFooter className="flex flex-col gap-3 px-8 pb-8">
                            <Button
                                color="primary"
                                type="submit"
                                className="w-full"
                                isLoading={isLoading}
                            >
                                Sign In
                            </Button>

                            <Divider className="my-2"/>

                            <div className="text-center text-sm text-default-500">
                                <p>
                                    Need help? Contact{" "}
                                    <Link size="sm" href="mailto:support@marlin-live.com">
                                        support@marlin-live.com
                                    </Link>
                                </p>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </>
    );
}
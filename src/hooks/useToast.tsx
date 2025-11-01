import {addToast} from "@heroui/toast";

type ToastColor = "default" | "primary" | "secondary" | "success" | "warning" | "danger";
interface ToastOptions {
    timeout?: number;
    closable?: boolean;
    color?: ToastColor;
}

const buildToastConfig = (
    color: ToastColor,
    options?: ToastOptions,
) => ({
    color: options?.color ?? color,
    timeout: options?.timeout ?? 5000,
    hideCloseButton: options?.closable === false,
});

export const useToast = () => {
    const showSuccess = (message: string, options?: ToastOptions) => {
        addToast({
            title: "Success",
            description: message,
            ...buildToastConfig("success", options),
        });
    };

    const showError = (message: string, options?: ToastOptions) => {
        addToast({
            title: "Error",
            description: message,
            ...buildToastConfig("danger", options),
        });
    };

    const showWarning = (message: string, options?: ToastOptions) => {
        addToast({
            title: "Warning",
            description: message,
            ...buildToastConfig("warning", options),
        });
    };

    const showInfo = (message: string, options?: ToastOptions) => {
        addToast({
            title: "Info",
            description: message,
            ...buildToastConfig("primary", options),
        });
    };

    const show = (
        title: string,
        message: string,
        type: "success" | "error" | "warning" | "info" = "info",
        options?: ToastOptions,
    ) => {
        const colorMap: Record<"success" | "error" | "warning" | "info", ToastColor> = {
            success: "success",
            error: "danger",
            warning: "warning",
            info: "primary",
        };

        addToast({
            title,
            description: message,
            ...buildToastConfig(colorMap[type], options),
        });
    };

    return {
        showSuccess,
        showError,
        showWarning,
        showInfo,
        show,
    };
};

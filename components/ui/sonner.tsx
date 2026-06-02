"use client";

import type { ComponentProps } from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = ComponentProps<typeof Sonner>;

const defaultToastClassNames: NonNullable<
  ToasterProps["toastOptions"]
>["classNames"] = {
  toast:
    "group toast group-[.toaster]:rounded-xl group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:bg-card/95 group-[.toaster]:p-4 group-[.toaster]:text-foreground group-[.toaster]:backdrop-blur-xl group-[.toaster]:shadow-[0_18px_36px_rgba(30,41,59,0.14)] dark:group-[.toaster]:shadow-[0_16px_36px_rgba(0,0,0,0.4)]",
  title: "group-[.toast]:font-semibold",
  description:
    "group-[.toast]:text-sm group-[.toast]:text-muted-foreground",
  actionButton:
    "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:shadow-sm",
  cancelButton:
    "group-[.toast]:bg-secondary group-[.toast]:text-secondary-foreground",
  closeButton:
    "group-[.toast]:border-border group-[.toast]:bg-background group-[.toast]:text-muted-foreground group-[.toast]:transition-colors group-[.toast]:hover:text-foreground",
};

const Toaster = ({ toastOptions, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  const { classNames, ...toastOptionOverrides } = toastOptions ?? {};

  return (
    <Sonner
      position="bottom-left"
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      closeButton
      richColors
      duration={4200}
      visibleToasts={4}
      toastOptions={{
        ...toastOptionOverrides,
        classNames: {
          ...defaultToastClassNames,
          ...classNames,
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

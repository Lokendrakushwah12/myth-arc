"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import type { Transition } from "motion/react";
import type { ReactElement } from "react";
import {
  Children,
  cloneElement,
  useEffect,
  useState,
  useId,
  isValidElement,
} from "react";

type ChildProps = {
  "data-id": string;
  className?: string;
  children: React.ReactNode;
  "aria-selected"?: boolean;
  "data-checked"?: string;
};

type AnimatedBackgroundProps = {
  children: ReactElement<ChildProps> | ReactElement<ChildProps>[];
  defaultValue?: string;
  onValueChange?: (newActiveId: string | null) => void;
  className?: string;
  transition?: Transition;
  enableHover?: boolean;
};

export function AnimatedBackground({
  children,
  defaultValue,
  onValueChange,
  className,
  transition,
  enableHover = false,
}: AnimatedBackgroundProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const uniqueId = useId();

  const handleSetActiveId = (id: string | null) => {
    setActiveId(id);
    if (onValueChange) {
      onValueChange(id);
    }
  };

  useEffect(() => {
    if (defaultValue !== undefined) {
      setActiveId(defaultValue);
    }
  }, [defaultValue]);

  return (
    <>
      {Children.map(children, (child) => {
        if (!isValidElement<ChildProps>(child)) return null;

        const id = child.props["data-id"];
        const interactionProps = enableHover
          ? {
              onMouseEnter: () => handleSetActiveId(id),
              onMouseLeave: () => handleSetActiveId(null),
            }
          : {
              onClick: () => handleSetActiveId(id),
            };

        return cloneElement(
          child,
          {
            key: id,
            className: cn("relative inline-flex", child.props.className),
            "aria-selected": activeId === id,
            "data-checked": activeId === id ? "true" : "false",
            ...interactionProps,
          },
          <>
            <AnimatePresence initial={false}>
              {activeId === id && (
                <motion.div
                  layoutId={`background-${uniqueId}`}
                  className={cn("absolute inset-0", className)}
                  transition={transition}
                  initial={{ opacity: defaultValue ? 1 : 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>
            <span className="z-10">{child.props.children}</span>
          </>,
        );
      })}
    </>
  );
}

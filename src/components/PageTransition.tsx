import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

export const PageTransition = ({ children }: PageTransitionProps) => {
  return (
    <div className="animate-enter opacity-0 [animation-fill-mode:forwards]">
      {children}
    </div>
  );
};

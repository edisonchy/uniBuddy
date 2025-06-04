import { Toaster } from "sonner";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      {children}
      <Toaster />
    </div>
  );
}

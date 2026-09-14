import "./globals.css";
import SupabaseAuthListener from "@/components/SupabaseAuthListener";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SupabaseAuthListener />
        {children}
      </body>
    </html>
  );
}
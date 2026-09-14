import { Metadata } from "next";
import StaffShell from "./_components/StaffShell";

export const metadata: Metadata = {
  title: "Staff Dashboard | CoPassage",
  description: "CoPassage City Staff portal",
};

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StaffShell>{children}</StaffShell>;
}

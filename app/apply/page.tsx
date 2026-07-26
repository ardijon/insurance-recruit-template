import { ApplicationForm } from "@/components/application-form";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ApplyPage() {
  return (
    <main>
      <ThemeToggle />
      <ApplicationForm />
    </main>
  );
}

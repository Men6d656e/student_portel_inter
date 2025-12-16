import { redirect } from "next/navigation";

export default function DashboardPage() {
  // Directly redirect to teachers page as it seems to be the first logical view
  // Or we could display a summary stats page here. 
  // For now, let's redirect to ensure the user lands somewhere useful if there's no dedicated 'overview' yet.
  // Actually, user mentioned "dashboard route *now contain*...". 
  // Let's redirect to 'teachers' for now or show a "Welcome" card.

  // Let's redirect to teachers as default active tab
  redirect("/dashboard/teachers");
}

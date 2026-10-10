import { auth } from "@/auth";
import PremiumHome from "@/components/PremiumHome";

export default async function Home() {
  const session = await auth();
  return <PremiumHome signedIn={Boolean(session?.user)} />;
}

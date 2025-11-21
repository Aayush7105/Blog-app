import BlogApp from "@/components/BlogApp";
import LandingPage from "@/components/LandingPage";

console.log(process.env.GOOGLE_CLIENT_SECRET);
console.log(process.env.GOOGLE_CLIENT_ID);

export default function Home() {
  return <LandingPage />;
}

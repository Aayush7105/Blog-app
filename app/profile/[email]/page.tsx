import ProfilePage from "@/components/ProfilePage";

export default function Page({ params }: { params: { email: string } }) {
  return <ProfilePage email={decodeURIComponent(params.email)} />;
}

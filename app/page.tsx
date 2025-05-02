import Navbar from "@/components/(home)/navbar";
import ChatSection from "./chat-section";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-10 p-24 background-gradient">
      <Navbar />
      <ChatSection />
    </main>
  );
}

import { KeysManager } from "./clerk/components/KeysManager";

export default function Home() {
  return (
    <main className="w-full h-full flex flex-col justify-center items-center">
      <KeysManager />
    </main>
  );
}

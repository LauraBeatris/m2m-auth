import { KeysManager } from "./clerk/components/KeysManager";

const baseUrl = "https://m2m-auth.vercel.app";
const curlCommand = `curl -H "Authorization: Bearer YOUR_API_KEY" ${baseUrl}/api/protected-with-key`;

export default function Home() {
  return (
    <main className="max-w-2xl flex flex-col justify-start items-start gap-4">
      <KeysManager />

      <div className="flex flex-col gap-2">
        <span>Test API route authenticating with your key:</span>
        <code>{curlCommand}</code>
      </div>
    </main>
  );
}

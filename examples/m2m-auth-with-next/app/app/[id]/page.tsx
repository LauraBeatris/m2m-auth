import { KeysManager } from "@/app/clerk/components/KeysManager";
import { getAppById, getBaseUrl } from "@/app/constants";

interface AppPageProps {
  params: {
    id: string;
  };
}

const curlCommand = `curl -H "Authorization: Bearer YOUR_API_KEY" ${getBaseUrl()}/api/protected-with-key`;

export default function AppPage({ params }: AppPageProps) {
  const app = getAppById(params.id);

  if (!app) {
    return <h1 className="text-2xl text-gray-800 font-bold">App not found</h1>;
  }

  return (
    <main className="max-w-[400px] flex flex-col justify-start items-start gap-4">
      <h1 className="text-2xl text-gray-800 font-bold">{app?.name}</h1>

      <KeysManager externalClientId={app.id} />

      <div className="flex flex-col gap-2">
        <span>Test API route authenticating with your key:</span>
        <code>{curlCommand}</code>
      </div>
    </main>
  );
}

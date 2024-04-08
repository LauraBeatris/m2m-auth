import { currentUser } from "@clerk/nextjs";
import Link from "next/link";
import { apps } from "./constants";

export default async function Home() {
  const user = await currentUser();

  return (
    <main className="max-w-2xl flex flex-col justify-start items-start gap-4">
      <h1 className="text-2xl text-gray-800 font-bold">
        Welcome {user?.firstName}!
      </h1>
      <h2 className="text-xl text-gray-800 font-medium">Your applications:</h2>
      {apps.map(({ id, name }) => (
        <Link
          className="underline underline-offset-4"
          key={id}
          href={`/app/${id}`}
        >
          {name}
        </Link>
      ))}
    </main>
  );
}

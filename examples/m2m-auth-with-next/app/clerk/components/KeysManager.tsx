"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { CreateKeySchema, Key, createApiKey } from "../actions";

type ServerAction<T> = ((data: T) => Promise<void>) & Function;

interface KeysManagerProps extends Pick<CreateKeySchema, "externalClientId"> {}

interface CreateKeyFormProps
  extends Pick<KeysManagerProps, "externalClientId"> {
  onCreateApiKey: ServerAction<FormData>;
}

interface KeyModalProps {
  keyValue: Key["key"];
  keyId: Key["keyId"];
  setKey: React.Dispatch<React.SetStateAction<Key | undefined>>;
}

/**
 * This would be exported from `@clerk/nextjs`. For the purpose of this demo, this component lacks customization
 * and focuses only on the key generation.
 */
export function KeysManager({ externalClientId }: KeysManagerProps) {
  const [key, setKey] = useState<Key>();

  async function onCreateApiKey(formData: FormData) {
    createApiKey(formData).then((key) => setKey(key));
  }

  return (
    <section className="w-full flex flex-col justify-center items-center rounded-lg text-gray-800 gap-2">
      <div className="w-full gap-2">
        <h1 className="text-xl font-bold">API Keys</h1>
        <CreateKeyForm
          onCreateApiKey={onCreateApiKey}
          externalClientId={externalClientId}
        />
      </div>

      {!!key && (
        <KeyModal keyValue={key.key} keyId={key.keyId} setKey={setKey} />
      )}
    </section>
  );
}

function KeyModal({ keyId, keyValue, setKey }: KeyModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="px-6 py-4 relative top-20 mx-auto w-96 shadow-lg rounded-md bg-gray-700">
        <div className="mt-2 text-left">
          <h3 className="text-lg leading-6 font-medium text-white">
            API Key Created
          </h3>
          <div className="py-3">
            <p className="text-sm text-white">
              Please copy the information for your new API key.
            </p>
            <div className="mt-4 w-full flex flex-col justify-start items-start">
              <label
                htmlFor="apiKeyId"
                className="block text-sm font-medium text-gray-200"
              >
                ID
              </label>
              <div className="w-full mt-1 relative rounded-md shadow-sm">
                <input
                  type="text"
                  name="apiKeyId"
                  id="apiKeyId"
                  className="w-full pl-3 pr-10 py-2 sm:text-sm rounded-md"
                  readOnly
                  defaultValue={keyId}
                />
              </div>
            </div>
            <div className="mt-4">
              <label
                htmlFor="apiKeyToken"
                className="flex text-sm font-medium text-gray-200"
              >
                Key
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="text"
                  name="apiKeyToken"
                  id="apiKeyToken"
                  className="block w-full pl-3 pr-10 py-2 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  readOnly
                  defaultValue={keyValue}
                />
              </div>
            </div>
          </div>
          <div className="items-center py-3">
            <button
              onClick={() => setKey(undefined)}
              className="py-2 bg-white text-gray-700 text-base font-medium rounded-md w-full shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateKeyForm({
  onCreateApiKey,
  externalClientId,
}: CreateKeyFormProps) {
  return (
    <form
      action={onCreateApiKey}
      className="w-full flex flex-col justify-start items-start gap-2 mt-2"
    >
      <label htmlFor="name">Key Name</label>
      <input
        className="w-full bg-gray-100 rounded-md p-2"
        type="text"
        name="name"
        required
      />
      <input hidden name="externalClientId" defaultValue={externalClientId} />
      <CreateKeyFormButton />
    </form>
  );
}

function CreateKeyFormButton() {
  const { pending } = useFormStatus();

  return (
    <button className="bg-gray-800 p-2 w-full text-white font-medium rounded-md">
      {pending ? "Creating Key..." : "Create New Key"}
    </button>
  );
}

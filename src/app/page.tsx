import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-4 sm:p-8">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 text-center">
        Potlock Project Agent
      </h1>
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <ul className="space-y-4">
          <li>
            <a
              href="https://docs.mintbase.xyz/ai/mintbase-plugins"
              target="_blank"
              rel="noreferrer"
              className="block p-4 bg-blue-100 rounded-lg hover:bg-blue-200 transition duration-300"
            >
              <span className="text-lg font-semibold text-blue-600">
                Minbase Docs
              </span>
            </a>
          </li>
          <li>
            <Link href="/.well-known/ai-plugin.json">
              <span className="block p-4 bg-blue-100 rounded-lg hover:bg-blue-200 transition duration-300">
                <span className="text-lg font-semibold text-blue-600">
                  OpenAPI Spec
                </span>
              </span>
            </Link>
          </li>
          <li>
            <Link href="/api/swagger">
              <span className="block p-4 bg-blue-100 rounded-lg hover:bg-blue-200 transition duration-300">
                <span className="text-lg font-semibold text-blue-600">
                  Swagger
                </span>
              </span>
            </Link>
          </li>
          <li>
            <a
              href="https://github.com/Jikugodwill/potlock-project-agent"
              target="_blank"
              rel="noreferrer"
              className="block p-4 bg-blue-100 rounded-lg hover:bg-blue-200 transition duration-300"
            >
              <span className="text-lg font-semibold text-blue-600">
                Source Code
              </span>
            </a>
          </li>
        </ul>
      </div>
    </main>
  );
}
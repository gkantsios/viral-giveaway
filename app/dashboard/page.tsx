"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Giveaway {
  id: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
  _count?: {
    entries: number;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchGiveaways();
    }
  }, [status, router]);

  async function fetchGiveaways() {
    try {
      const response = await fetch("/api/giveaways");
      if (response.ok) {
        const data = await response.json();
        setGiveaways(data);
      }
    } catch (error) {
      console.error("Failed to fetch giveaways:", error);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {session?.user?.email}
          </p>
        </div>

        {/* Actions */}
        <div className="mb-8">
          <Link
            href="/giveaway/create"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Create New Giveaway
          </Link>
        </div>

        {/* Giveaways List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Your Giveaways
          </h2>

          {giveaways.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-600 mb-4">
                You haven&apos;t created any giveaways yet.
              </p>
              <Link
                href="/giveaway/create"
                className="text-purple-600 hover:underline font-medium"
              >
                Create your first giveaway
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {giveaways.map((giveaway) => (
                <div
                  key={giveaway.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {giveaway.title}
                      </h3>
                      {giveaway.description && (
                        <p className="text-gray-600 text-sm mb-4">
                          {giveaway.description}
                        </p>
                      )}
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span className="px-3 py-1 bg-gray-100 rounded-full">
                          {giveaway.status}
                        </span>
                        <span>
                          {giveaway._count?.entries || 0} entries
                        </span>
                        <span>
                          Created {new Date(giveaway.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/giveaway/${giveaway.id}`}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

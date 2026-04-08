import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const giveaways = await db.giveaway.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { entries: true } } },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Giveaways</h1>
          <Link
            href="/dashboard/giveaways/new"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
          >
            + New Giveaway
          </Link>
        </div>

        {giveaways.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-500 mb-4">No giveaways yet.</p>
            <Link
              href="/dashboard/giveaways/new"
              className="text-purple-600 hover:underline text-sm"
            >
              Create your first giveaway
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {giveaways.map((g) => (
              <div
                key={g.id}
                className="bg-white rounded-xl border border-gray-100 p-6 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-semibold text-gray-900">{g.title}</h2>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        g.status === "PUBLISHED"
                          ? "bg-green-100 text-green-700"
                          : g.status === "ENDED"
                          ? "bg-gray-100 text-gray-500"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {g.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Prize: {g.prize} · {g._count.entries} entries ·{" "}
                    {formatDate(g.createdAt)}
                  </p>
                </div>
                <Link
                  href={`/dashboard/giveaways/${g.id}`}
                  className="text-sm text-purple-600 hover:underline"
                >
                  Manage →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

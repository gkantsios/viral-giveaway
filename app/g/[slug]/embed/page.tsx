import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { isGiveawayActive } from "@/lib/utils";

export default async function EmbedPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { theme?: string; ref?: string };
}) {
  const giveaway = await db.giveaway.findUnique({
    where: { slug: params.slug },
    include: { _count: { select: { entries: true } } },
  });

  if (!giveaway || !isGiveawayActive(giveaway)) {
    notFound();
  }

  const theme = searchParams.theme === "dark" ? "dark" : "light";
  const isDark = theme === "dark";

  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{giveaway.title}</title>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Notify parent of height for responsive resizing
              function notifyHeight() {
                window.parent.postMessage({
                  type: 'hap:resize',
                  slug: '${giveaway.slug}',
                  height: document.body.scrollHeight
                }, '*');
              }
              window.addEventListener('load', notifyHeight);
              new ResizeObserver(notifyHeight).observe(document.body);
            `,
          }}
        />
      </head>
      <body
        className={`m-0 p-4 font-sans ${isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        <div className="max-w-sm mx-auto">
          <h2 className="text-lg font-bold mb-1">{giveaway.title}</h2>
          {giveaway.description && (
            <p className={`text-sm mb-3 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              {giveaway.description}
            </p>
          )}
          <p className={`text-sm mb-4 font-medium ${isDark ? "text-purple-300" : "text-purple-700"}`}>
            Prize: {giveaway.prize}
          </p>
          <p className={`text-xs mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {giveaway._count.entries} entries so far
          </p>

          <form
            id="entry-form"
            className="space-y-3"
            onSubmit={undefined}
          >
            {searchParams.ref && (
              <input type="hidden" name="referralCode" value={searchParams.ref} />
            )}
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                isDark
                  ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
              }`}
            />
            <button
              type="submit"
              className="w-full py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
            >
              Enter Giveaway
            </button>
          </form>
          <div id="entry-result" className="mt-3 text-sm hidden" />
        </div>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.getElementById('entry-form').addEventListener('submit', async function(e) {
                e.preventDefault();
                var form = e.target;
                var btn = form.querySelector('button[type=submit]');
                var result = document.getElementById('entry-result');
                btn.disabled = true;
                btn.textContent = 'Entering…';
                try {
                  var formData = new FormData(form);
                  var body = { email: formData.get('email') };
                  var ref = formData.get('referralCode');
                  if (ref) body.referralCode = ref;
                  var res = await fetch('/api/g/${giveaway.slug}/enter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                  });
                  var data = await res.json();
                  result.classList.remove('hidden');
                  if (res.ok) {
                    result.style.color = '${isDark ? "#86efac" : "#16a34a"}';
                    result.textContent = data.message || 'Entered! Check your email.';
                    if (data.referralCode) {
                      var refUrl = window.location.origin + '/g/${giveaway.slug}?ref=' + data.referralCode;
                      result.innerHTML += '<br><span style="color:${isDark ? "#c4b5fd" : "#7c3aed"}">Share your link: ' + refUrl + '</span>';
                    }
                  } else {
                    result.style.color = '#ef4444';
                    result.textContent = typeof data.error === 'string' ? data.error : 'Something went wrong.';
                    btn.disabled = false;
                    btn.textContent = 'Enter Giveaway';
                  }
                } catch(err) {
                  result.classList.remove('hidden');
                  result.style.color = '#ef4444';
                  result.textContent = 'Network error. Please try again.';
                  btn.disabled = false;
                  btn.textContent = 'Enter Giveaway';
                }
              });
            `,
          }}
        />
      </body>
    </html>
  );
}

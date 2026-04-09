interface SyncSubscriberParams {
  provider: "MAILCHIMP" | "CONVERTKIT" | "ACTIVECAMPAIGN";
  accessToken: string;
  listId: string | null;
  email: string;
  name?: string;
}

export async function syncSubscriberToEsp({
  provider,
  accessToken,
  listId,
  email,
  name,
}: SyncSubscriberParams): Promise<void> {
  switch (provider) {
    case "MAILCHIMP":
      await syncMailchimp({ accessToken, listId, email, name });
      break;
    case "CONVERTKIT":
      await syncConvertKit({ accessToken, listId, email, name });
      break;
    case "ACTIVECAMPAIGN":
      await syncActiveCampaign({ accessToken, listId, email, name });
      break;
  }
}

async function syncMailchimp({
  accessToken,
  listId,
  email,
  name,
}: {
  accessToken: string;
  listId: string | null;
  email: string;
  name?: string;
}) {
  if (!listId) throw new Error("Mailchimp requires a list ID");

  // Mailchimp API key format: key-dcXX
  const dc = accessToken.split("-").pop();
  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      email_address: email,
      status: "subscribed",
      ...(name ? { merge_fields: { FNAME: name.split(" ")[0] } } : {}),
    }),
  });

  if (!res.ok && res.status !== 400) {
    // 400 means already subscribed, which is fine
    throw new Error(`Mailchimp sync failed: ${res.status}`);
  }
}

async function syncConvertKit({
  accessToken,
  listId,
  email,
  name,
}: {
  accessToken: string;
  listId: string | null;
  email: string;
  name?: string;
}) {
  // listId is form ID in ConvertKit
  if (!listId) throw new Error("ConvertKit requires a form ID");

  const res = await fetch(
    `https://api.convertkit.com/v3/forms/${listId}/subscribe`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: accessToken,
        email,
        ...(name ? { first_name: name.split(" ")[0] } : {}),
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`ConvertKit sync failed: ${res.status}`);
  }
}

async function syncActiveCampaign({
  accessToken,
  listId,
  email,
  name,
}: {
  accessToken: string;
  listId: string | null;
  email: string;
  name?: string;
}) {
  // accessToken format: "apiKey:::baseUrl"
  const [apiKey, baseUrl] = accessToken.split(":::");
  if (!baseUrl) throw new Error("ActiveCampaign requires baseUrl in token");

  // Create/update contact
  const contactRes = await fetch(`${baseUrl}/api/3/contacts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Token": apiKey,
    },
    body: JSON.stringify({
      contact: {
        email,
        ...(name ? { firstName: name.split(" ")[0] } : {}),
      },
    }),
  });

  if (!contactRes.ok) {
    throw new Error(`ActiveCampaign contact create failed: ${contactRes.status}`);
  }

  // Add to list if listId provided
  if (listId) {
    const data = await contactRes.json();
    const contactId = data.contact?.id;
    if (contactId) {
      await fetch(`${baseUrl}/api/3/contactLists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Token": apiKey,
        },
        body: JSON.stringify({
          contactList: { list: listId, contact: contactId, status: 1 },
        }),
      });
    }
  }
}

import dotenv from "dotenv";
dotenv.config({ path: new URL("../.env", import.meta.url) });

const BASE = "http://localhost:4000/api";

async function req(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function run() {
  console.log("[smoke] health...");
  const health = await req("/health");
  assert(health.ok && health.data.status === "ok", "health failed");

  console.log("[smoke] first-time create password for student...");
  let r = await req("/auth/create-password", {
    method: "POST",
    body: { email: "student1@rguktrkv.ac.in", password: "Test123!" },
  });
  assert(r.ok && r.data.token, "student create-password failed");
  const studentToken = r.data.token;

  console.log("[smoke] login student...");
  r = await req("/auth/login", {
    method: "POST",
    body: { email: "student1@rguktrkv.ac.in", password: "Test123!" },
  });
  assert(r.ok && r.data.token, "student login failed");

  console.log("[smoke] student home...");
  r = await req("/student/home", { token: studentToken });
  assert(r.ok, "student home failed");

  console.log("[smoke] list communities...");
  r = await req("/student/communities", { token: studentToken });
  assert(r.ok && Array.isArray(r.data), "communities list failed");
  const communityId = r.data[0]?.id;

  if (communityId) {
    console.log("[smoke] join community...");
    r = await req(`/student/communities/${communityId}/join`, { method: "POST", token: studentToken });
    assert(r.ok, "join community failed");

    console.log("[smoke] community details...");
    r = await req(`/student/communities/${communityId}`, { token: studentToken });
    assert(r.ok && r.data.community?.id === communityId, "community details failed");
  }

  console.log("[smoke] list insights...");
  r = await req("/student/insights", { token: studentToken });
  assert(r.ok, "student insights failed");

  console.log("[smoke] student events...");
  r = await req("/student/events", { token: studentToken });
  assert(r.ok, "student events failed");
  const eventId = r.data[0]?.id;
  if (eventId) {
    console.log("[smoke] register event...");
    r = await req(`/student/events/${eventId}/register`, { method: "POST", token: studentToken });
    assert(r.ok, "register event failed");
  }

  console.log("[smoke] create-password for alumni...");
  r = await req("/auth/create-password", {
    method: "POST",
    body: { email: "alumni1@rguktrkv.ac.in", password: "Test123!" },
  });
  assert(r.ok && r.data.token, "alumni create-password failed");
  const alumniToken = r.data.token;

  console.log("[smoke] alumni post insight...");
  r = await req("/alumni/insights", { method: "POST", token: alumniToken, body: { title: "Welcome", content: "Sharing experience" } });
  assert(r.ok, "alumni post insight failed");

  console.log("[smoke] create-password for faculty...");
  r = await req("/auth/create-password", {
    method: "POST",
    body: { email: "faculty1@rguktrkv.ac.in", password: "Test123!" },
  });
  assert(r.ok && r.data.token, "faculty create-password failed");
  const facultyToken = r.data.token;

  console.log("[smoke] faculty create event...");
  r = await req("/faculty/events", {
    method: "POST",
    token: facultyToken,
    body: { title: "Workshop", date: new Date().toISOString(), location: "Lab", description: "Hands-on" },
  });
  assert(r.ok, "faculty create event failed");

  console.log("[smoke] ALL PASS ✔\n");
}

run().catch((e) => {
  console.error("[smoke] FAILED:", e.message);
  process.exit(1);
});

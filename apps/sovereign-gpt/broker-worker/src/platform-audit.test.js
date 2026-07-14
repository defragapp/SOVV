import assert from "node:assert/strict"
import test from "node:test"
import { __test } from "./platform-audit.js"

const healthyGithub = {
  ok: true,
  data: {
    open_pull_requests: [],
  },
}

const healthyCloudflare = {
  ok: true,
  data: {
    workers: {
      ok: true,
      data: [
        { name: "sovereign-broker" },
        { name: "sovv-web" },
      ],
    },
    pages: {
      ok: true,
      data: [],
    },
  },
}

const healthyStripe = {
  ok: true,
  data: {
    active_subscriptions: 0,
  },
}

test("returns a product-validation recommendation when all systems are connected", () => {
  const recommendations = __test.buildRecommendations({
    github: healthyGithub,
    cloudflare: healthyCloudflare,
    stripe: healthyStripe,
  })

  assert.equal(recommendations.length, 1)
  assert.equal(recommendations[0].area, "platform")
  assert.equal(recommendations[0].priority, 3)
})

test("prioritizes missing Cloudflare connectivity", () => {
  const recommendations = __test.buildRecommendations({
    github: healthyGithub,
    cloudflare: { ok: false, error: "403" },
    stripe: healthyStripe,
  })

  assert.equal(recommendations[0].area, "cloudflare")
  assert.equal(recommendations[0].priority, 1)
})

test("reports missing required workers", () => {
  const recommendations = __test.buildRecommendations({
    github: healthyGithub,
    cloudflare: {
      ok: true,
      data: {
        workers: { ok: true, data: [] },
        pages: { ok: true, data: [] },
      },
    },
    stripe: healthyStripe,
  })

  assert.deepEqual(
    recommendations.filter((item) => item.priority === 1).map((item) => item.area),
    ["broker", "web"],
  )
})

test("does not treat missing Pages evidence as a Worker outage", () => {
  const recommendations = __test.buildRecommendations({
    github: healthyGithub,
    cloudflare: {
      ok: true,
      data: {
        workers: healthyCloudflare.data.workers,
        pages: { ok: false, error: "404" },
      },
    },
    stripe: healthyStripe,
  })

  assert.deepEqual(recommendations.map((item) => item.area), ["cloudflare-pages"])
  assert.equal(recommendations[0].priority, 3)
})

test("reports Workers read failure separately from total Cloudflare failure", () => {
  const recommendations = __test.buildRecommendations({
    github: healthyGithub,
    cloudflare: {
      ok: true,
      data: {
        workers: { ok: false, error: "403" },
        pages: { ok: true, data: [] },
      },
    },
    stripe: healthyStripe,
  })

  assert.equal(recommendations[0].area, "cloudflare-workers")
  assert.equal(recommendations[0].priority, 1)
})

test("reports open pull requests before general product work", () => {
  const recommendations = __test.buildRecommendations({
    github: { ok: true, data: { open_pull_requests: [{ number: 160 }] } },
    cloudflare: healthyCloudflare,
    stripe: healthyStripe,
  })

  assert.equal(recommendations[0].area, "repository")
  assert.equal(recommendations[0].priority, 2)
})

test("normalizes rejected promises without leaking internals", () => {
  const result = __test.settledResult({ status: "rejected", reason: new Error("Unauthorized") })
  assert.deepEqual(result, { ok: false, error: "Unauthorized" })
})

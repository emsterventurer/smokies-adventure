"use strict";

const crypto = require("node:crypto");

const INVITATION_KEY_DOMAIN =
  "adventure-invitation:v1\0";

function normalizeInvitationEmail(value) {
  if (typeof value !== "string") {
    throw new TypeError(
      "A valid invitation email is required.",
    );
  }

  const normalized = value.trim().toLowerCase();

  if (
    normalized.length === 0 ||
    normalized.length > 320 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      normalized,
    )
  ) {
    throw new TypeError(
      "A valid invitation email is required.",
    );
  }

  return normalized;
}

function deriveInvitationEmailKey(
  secret,
  email,
) {
  if (
    typeof secret !== "string" ||
    secret.length < 32
  ) {
    throw new TypeError(
      "A valid invitation HMAC secret is required.",
    );
  }

  const normalizedEmail =
    normalizeInvitationEmail(email);

  return crypto
    .createHmac("sha256", secret)
    .update(
      `${INVITATION_KEY_DOMAIN}${normalizedEmail}`,
      "utf8",
    )
    .digest("base64url");
}

module.exports = Object.freeze({
  INVITATION_KEY_DOMAIN,
  normalizeInvitationEmail,
  deriveInvitationEmailKey,
});

(function (root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  root.AdventureInvitation = api;
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function () {
    "use strict";

    function eligibleInviteTargets(options = {}) {
      const participants = Array.isArray(
        options.adventure?.participants,
      )
        ? options.adventure.participants
        : [];
      const adventurers = Array.isArray(options.adventurers)
        ? options.adventurers
        : [];
      const directoryById = new Map(
        adventurers
          .filter(
            (adventurer) =>
              typeof adventurer?.id === "string" &&
              adventurer.active === true,
          )
          .map((adventurer) => [adventurer.id, adventurer]),
      );
      const seen = new Set();

      return participants.flatMap((participant) => {
        const adventurerId = participant?.adventurerId;
        const adventurer = directoryById.get(adventurerId);

        if (
          !adventurer ||
          adventurerId === options.activeAdventurerId ||
          seen.has(adventurerId)
        ) {
          return [];
        }

        seen.add(adventurerId);
        return [adventurer];
      });
    }

    function initializeAdventureInvitation(options = {}) {
      const document = options.document;
      const panel = document?.querySelector?.(
        "#adventureInvitationPanel",
      );
      const form = document?.querySelector?.(
        "#adventureInvitationForm",
      );
      const targetSelect = document?.querySelector?.(
        "#adventureInvitationTarget",
      );
      const emailInput = document?.querySelector?.(
        "#adventureInvitationEmail",
      );
      const submitButton = document?.querySelector?.(
        "#adventureInvitationSubmit",
      );
      const status = document?.querySelector?.(
        "#adventureInvitationStatus",
      );

      if (panel) {
        panel.hidden = true;
      }

      if (
        options.isAdventureAdmin !== true ||
        !options.adventure?.id ||
        typeof options.createInvitation !== "function" ||
        !panel ||
        !form ||
        !targetSelect ||
        !emailInput ||
        !submitButton ||
        !status
      ) {
        return Object.freeze({
          visible: false,
          targets: Object.freeze([]),
        });
      }

      const targets = eligibleInviteTargets(options);
      const targetById = new Map(
        targets.map((target) => [target.id, target]),
      );
      const placeholder = document.createElement("option");

      placeholder.value = "";
      placeholder.textContent = "Choose a traveler";
      targetSelect.replaceChildren(placeholder);

      targets.forEach((target) => {
        const option = document.createElement("option");
        option.value = target.id;
        option.textContent = target.displayName;
        targetSelect.appendChild(option);
      });

      panel.hidden = false;
      status.hidden = true;
      status.textContent = "";
      let submitting = false;

      form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (submitting) {
          return;
        }

        const target = targetById.get(targetSelect.value);
        const email = emailInput.value.trim();

        if (!target || !email) {
          status.textContent =
            "Choose a traveler and enter their email address.";
          status.hidden = false;
          return;
        }

        submitting = true;
        submitButton.disabled = true;
        submitButton.textContent = "Preparing invitation…";
        status.hidden = true;

        try {
          await options.createInvitation({
            adventureId: options.adventure.id,
            adventurerId: target.id,
            email,
          });
          emailInput.value = "";
          status.textContent =
            "Invitation ready. Share the Adventure Companion link with this traveler.";
          status.hidden = false;
        } catch (error) {
          status.textContent =
            "We couldn't prepare that invitation. Please try again.";
          status.hidden = false;
        } finally {
          submitting = false;
          submitButton.disabled = false;
          submitButton.textContent = "Prepare invitation";
        }
      });

      return Object.freeze({
        visible: true,
        targets: Object.freeze([...targets]),
      });
    }

    return Object.freeze({
      eligibleInviteTargets,
      initializeAdventureInvitation,
    });
  },
);

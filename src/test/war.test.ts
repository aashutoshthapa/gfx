import { describe, expect, it } from "vitest";
import { getPrimaryAttack, parseWarData } from "@/lib/war";

const sampleWarJson = JSON.stringify({
  state: "warEnded",
  teamSize: 5,
  attacksPerMember: 1,
  battleModifier: "hardMode",
  clan: {
    tag: "#2JCJ80G2",
    name: "Marcos Esports",
    badgeUrls: {
      small: "https://example.com/clan-small.png",
      medium: "https://example.com/clan-medium.png",
      large: "https://example.com/clan-large.png",
    },
    clanLevel: 12,
    attacks: 5,
    stars: 11,
    destructionPercentage: 94.4,
    members: [
      {
        tag: "#88JVJCCC",
        name: "Arrøw",
        townhallLevel: 18,
        mapPosition: 1,
        attacks: [
          {
            attackerTag: "#88JVJCCC",
            defenderTag: "#9U0RJ200R",
            stars: 2,
            destructionPercentage: 98,
            order: 9,
          },
        ],
      },
    ],
  },
  opponent: {
    tag: "#P98GCJJY",
    name: "TJN - ESPORTS",
    badgeUrls: {
      small: "https://example.com/opponent-small.png",
      medium: "https://example.com/opponent-medium.png",
      large: "https://example.com/opponent-large.png",
    },
    clanLevel: 5,
    attacks: 5,
    stars: 12,
    destructionPercentage: 90.6,
    members: [
      {
        tag: "#98J0L0RYY",
        name: "JN⚡MANAGER ⚡",
        townhallLevel: 18,
        mapPosition: 2,
        attacks: [
          {
            attackerTag: "#98J0L0RYY",
            defenderTag: "#88JVJCCC",
            stars: 3,
            destructionPercentage: 100,
            order: 2,
          },
        ],
      },
    ],
  },
});

describe("parseWarData", () => {
  it("accepts war api payloads with special-character member names", () => {
    const war = parseWarData(sampleWarJson);

    expect(war.clan.members[0].name).toBe("Arrøw");
    expect(war.opponent.members[0].name).toBe("JN⚡MANAGER ⚡");
    expect(war.clan.members[0].attacks[0].destructionPercentage).toBe(98);
  });

  it("picks the strongest attack for display", () => {
    const attack = getPrimaryAttack([
      { stars: 2, destructionPercentage: 98, order: 9 },
      { stars: 3, destructionPercentage: 84, order: 3 },
      { stars: 3, destructionPercentage: 100, order: 7 },
    ]);

    expect(attack).toEqual({ stars: 3, destructionPercentage: 100, order: 7 });
  });
});

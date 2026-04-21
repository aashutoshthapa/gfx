export interface Attack {
  attackerTag?: string;
  defenderTag?: string;
  stars: number;
  destructionPercentage: number;
  order?: number;
  duration?: number;
}

export interface Member {
  tag: string;
  name: string;
  townhallLevel: number;
  mapPosition: number;
  attacks: Attack[];
}

export interface BadgeUrls {
  small: string;
  medium: string;
  large: string;
}

export interface ClanData {
  tag: string;
  name: string;
  badgeUrls: BadgeUrls;
  clanLevel: number;
  attacks: number;
  stars: number;
  destructionPercentage: number;
  members: Member[];
}

export interface WarData {
  state?: string;
  teamSize?: number;
  attacksPerMember?: number;
  battleModifier?: string;
  preparationStartTime?: string;
  startTime?: string;
  endTime?: string;
  clan: ClanData;
  opponent: ClanData;
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }

  return value as Record<string, unknown>;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asAttack(value: unknown): Attack {
  const attack = asRecord(value, "Attack");

  return {
    attackerTag: asString(attack.attackerTag),
    defenderTag: asString(attack.defenderTag),
    stars: asNumber(attack.stars),
    destructionPercentage: asNumber(attack.destructionPercentage),
    order: asNumber(attack.order),
    duration: asNumber(attack.duration),
  };
}

function asMember(value: unknown): Member {
  const member = asRecord(value, "Member");
  const attacks = Array.isArray(member.attacks) ? member.attacks.map(asAttack) : [];

  return {
    tag: asString(member.tag),
    name: asString(member.name, "Unknown"),
    townhallLevel: asNumber(member.townhallLevel),
    mapPosition: asNumber(member.mapPosition),
    attacks,
  };
}

function asBadgeUrls(value: unknown): BadgeUrls {
  const badgeUrls = asRecord(value, "badgeUrls");
  const medium = asString(badgeUrls.medium) || asString(badgeUrls.large) || asString(badgeUrls.small);
  const large = asString(badgeUrls.large) || medium;
  const small = asString(badgeUrls.small) || medium;

  return {
    small,
    medium,
    large,
  };
}

function asClanData(value: unknown, label: string): ClanData {
  const clan = asRecord(value, label);

  return {
    tag: asString(clan.tag),
    name: asString(clan.name, label),
    badgeUrls: asBadgeUrls(clan.badgeUrls),
    clanLevel: asNumber(clan.clanLevel),
    attacks: asNumber(clan.attacks),
    stars: asNumber(clan.stars),
    destructionPercentage: asNumber(clan.destructionPercentage),
    members: Array.isArray(clan.members) ? clan.members.map(asMember) : [],
  };
}

export function parseWarData(input: string): WarData {
  let parsed: unknown;

  try {
    parsed = JSON.parse(input);
  } catch {
    throw new Error("Invalid JSON format");
  }

  const war = asRecord(parsed, "War data");

  if (!war.clan || !war.opponent) {
    throw new Error("JSON must contain 'clan' and 'opponent' fields");
  }

  return {
    state: asString(war.state),
    teamSize: asNumber(war.teamSize),
    attacksPerMember: asNumber(war.attacksPerMember),
    battleModifier: asString(war.battleModifier),
    preparationStartTime: asString(war.preparationStartTime),
    startTime: asString(war.startTime),
    endTime: asString(war.endTime),
    clan: asClanData(war.clan, "Clan"),
    opponent: asClanData(war.opponent, "Opponent"),
  };
}

export function getPrimaryAttack(attacks: Attack[]): Attack | null {
  if (!attacks.length) {
    return null;
  }

  return [...attacks].sort((a, b) => {
    if (b.stars !== a.stars) {
      return b.stars - a.stars;
    }

    if (b.destructionPercentage !== a.destructionPercentage) {
      return b.destructionPercentage - a.destructionPercentage;
    }

    return (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER);
  })[0];
}

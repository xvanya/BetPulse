import api from "../api/axiosConfig.ts";


export type MatchDto = {
    id: number;
    homeTeam: string;
    awayTeam: string;
    homeOdd: number;
    awayOdd: number;
    startTime: string;
    status: string;
    competitionId: number;
    country: string;
    competition: string;
    sportKey: string;
    isLive: boolean;
};

type RawMatch = {
    id: number;
    externalId: string;
    team1: string;
    team2: string;
    startTime: string;
    status: string;
    odds1: number;
    oddsX: number;
    odds2: number;
    competitionId: number;
    competition: {
        id: number;
        name: string;
        sportId: number;
        country: string;
    };
    isManual: boolean;
};

const COMPETITION_META: Record<number, { country: string; competition: string; sportKey: string }> = {
    2: { country: "Англія", competition: "Premier League", sportKey: "football" },
    3: { country: "Європа", competition: "Ліга Чемпіонів", sportKey: "football" },
    4: { country: "США", competition: "NBA", sportKey: "basketball" },
    6: { country: "Іспанія", competition: "La Liga", sportKey: "football" },
    7: { country: "Італія", competition: "Serie A", sportKey: "football" },
    8: { country: "Німеччина", competition: "Bundesliga", sportKey: "football" },
    9: { country: "Франція", competition: "Ligue 1", sportKey: "football" },
};

const mapRawMatch = (raw: RawMatch): MatchDto => {
    const meta = COMPETITION_META[raw.competitionId] ?? {
        country: raw.competition.country,
        competition: raw.competition.name,
        sportKey: "other",
    };
    return {
        id: raw.id,
        homeTeam: raw.team1,
        awayTeam: raw.team2,
        homeOdd: raw.odds1,
        awayOdd: raw.odds2,
        startTime: raw.startTime,
        status: raw.status,
        competitionId: raw.competitionId,
        isLive: raw.status === "Live",
        ...meta,
    };
};

export const getPopularMatches = async (): Promise<MatchDto[]> => {
    const ids = [2, 3, 4, 6, 7, 8, 9];
    const results = await Promise.all(
        ids.map((id) => api.get(`/matches?competitionId=${id}`))
    );
    const raw: RawMatch[] = results.flatMap((r) => r.data);
    return raw.map(mapRawMatch);
};
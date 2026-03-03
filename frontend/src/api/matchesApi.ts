import api from "./axiosConfig";

export type MatchDto = {
    id: number;
    sportKey: "football" | "tennis" | "basketball" | "volleyball";
    sportTitle: string;
    country: string;
    competition: string;
    homeTeam: string;
    awayTeam: string;
    homeOdd: number;
    awayOdd: number;
    startTime?: string;
    isLive: boolean;
};

type ApiMatchDto = {
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

const sportKeyFromSportId = (
    sportId: number
): MatchDto["sportKey"] => {
    switch (sportId) {
        case 2:
            return "football";
        case 4:
            return "tennis";
        case 3:
            return "basketball";
        case 1:
            return "volleyball";
        default:
            return "football";
    }
};

const sportTitleFromKey = (key: MatchDto["sportKey"]) => {
    switch (key) {
        case "football":
            return "ФУТБОЛ";
        case "tennis":
            return "ТЕНІС";
        case "basketball":
            return "БАСКЕТБОЛ";
        case "volleyball":
            return "ВОЛЕЙБОЛ";
    }
};

const toTimeHHmm = (iso: string) => {
    const d = new Date(iso);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
};

const isLiveByStatus = (status: string) => {
    const s = (status || "").toLowerCase();
    return s.includes("live") || s.includes("inplay") || s.includes("in_play") || s.includes("playing");
};

export const getPopularMatches = async (): Promise<MatchDto[]> => {
    const res = await api.get<ApiMatchDto[]>("/matches");

    return res.data.map((m) => {
        const sportKey = sportKeyFromSportId(m.competition?.sportId ?? 0);
        const live = isLiveByStatus(m.status);

        return {
            id: m.id,
            sportKey,
            sportTitle: sportTitleFromKey(sportKey),
            country: m.competition?.country ?? "—",
            competition: m.competition?.name ?? "—",
            homeTeam: m.team1,
            awayTeam: m.team2,
            homeOdd: m.odds1,
            awayOdd: m.odds2,
            startTime: live ? undefined : toTimeHHmm(m.startTime),
            isLive: live,
        };
    });
};
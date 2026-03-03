import { useEffect, useMemo, useState } from "react";
import Carousel from "../components/Carousel";
import "./HomePage.css";
import SectionTitle from "../components/SectionTitle";
import GameCategoryRow from "../components/GameCategoryRow";
import TileRow from "../components/TileRow";
import pokerIcon from "../assets/icons/poker.png";
import rouletteIcon from "../assets/icons/roulette.png";
import slotsIcon from "../assets/icons/slots.png";
import blackjackIcon from "../assets/icons/blackjack.png";
import fIcon from "../assets/icons/f.png";
import tIcon from "../assets/icons/t.png";
import QuickCategories from "../components/QuickCategories";
import PopularLeagues from "../components/PopularLeagues";
import PopularMatchesSection from "../components/PopularMatchesSection";
import CountryLeagueBlock from "../components/CountryLeagueBlock";
import { getPopularMatches } from "../api/matchesApi";
import type { MatchDto } from "../api/matchesApi";
import InfoFooterBlock from "../components/InfoFooterBlock";

type BlockItem = {
    id: number;
    homeTeam: string;
    awayTeam: string;
    homeOdd: number;
    awayOdd: number;
    time?: string;
};

type Group = {
    country: string;
    league: string;
    items: BlockItem[];
};

const groupByCountryLeague = (matches: MatchDto[]): Group[] => {
    const map = new Map<string, Group>();

    for (const m of matches) {
        const key = `${m.country}__${m.competition}`;
        if (!map.has(key)) {
            map.set(key, { country: m.country, league: m.competition, items: [] });
        }
        map.get(key)!.items.push({
            id: m.id,
            homeTeam: m.homeTeam,
            awayTeam: m.awayTeam,
            homeOdd: m.homeOdd,
            awayOdd: m.awayOdd,
            time: m.isLive ? undefined : m.startTime,
        });
    }
    return Array.from(map.values()).map((g) => ({
        ...g,
        items: g.items.slice(0, 3),
    }));
};

const pickFootballGroupsLikeFigma = (groups: Group[]) => {
    const norm = (s: string) => (s || "").toLowerCase();

    const england =
        groups.find((g) => norm(g.country).includes("англ")) ||
        groups.find((g) => norm(g.country).includes("eng"));

    const spain =
        groups.find((g) => norm(g.country).includes("іспан")) ||
        groups.find((g) => norm(g.country).includes("spain")) ||
        groups.find((g) => norm(g.country).includes("es"));

    const picked: Group[] = [];
    if (england) picked.push(england);
    if (spain && spain !== england) picked.push(spain);
    if (picked.length >= 2) return picked.slice(0, 2);
    return groups.slice(0, 2);
};

const tennisFallback: Group[] = [
    {
        country: "Відкритий Чемпіонат Австралії",
        league: "Кваліфікація - Чоловіки",
        items: [
            { id: 1001, homeTeam: "Арсенал", awayTeam: "Ліверпуль", homeOdd: 1.59, awayOdd: 5.65, time: undefined },
            { id: 1002, homeTeam: "Арсенал", awayTeam: "Ліверпуль", homeOdd: 1.59, awayOdd: 5.65, time: "20:00" },
            { id: 1003, homeTeam: "Арсенал", awayTeam: "Ліверпуль", homeOdd: 1.59, awayOdd: 5.65, time: "20:00" },
        ],
    },
    {
        country: "Відкритий Чемпіонат Австралії",
        league: "Кваліфікація - Чоловіки",
        items: [
            { id: 1004, homeTeam: "Джуліо Дзепп'єрі", awayTeam: "Реі Сакамото", homeOdd: 1.59, awayOdd: 5.65, time: undefined },
            { id: 1005, homeTeam: "Джуліо Дзепп'єрі", awayTeam: "Реі Сакамото", homeOdd: 1.59, awayOdd: 5.65, time: "20:00" },
            { id: 1006, homeTeam: "Джуліо Дзепп'єрі", awayTeam: "Реі Сакамото", homeOdd: 1.59, awayOdd: 5.65, time: "20:00" },
        ],
    },
];

const HomePage = () => {
    const [popularMatches, setPopularMatches] = useState<MatchDto[]>([]);
    const [popularLoading, setPopularLoading] = useState(true);

    useEffect(() => {
        const fetchPopular = async () => {
            try {
                const data = await getPopularMatches();
                setPopularMatches(data);
            } catch (e) {
                console.error(e);
            } finally {
                setPopularLoading(false);
            }
        };
        fetchPopular();
    }, []);

    const footballGroups = useMemo<Group[]>(() => {
        const football = popularMatches.filter((m) => m.sportKey === "football");
        const groups = groupByCountryLeague(football);
        return pickFootballGroupsLikeFigma(groups);
    }, [popularMatches]);

    const tennisGroups = useMemo<Group[]>(() => {
        const tennis = popularMatches.filter((m) => m.sportKey === "tennis");
        const groups = groupByCountryLeague(tennis);
        return groups.length ? groups.slice(0, 2) : tennisFallback;
    }, [popularMatches]);

    return (
        <div className="home-page">
            <div className="container-fluid p-0">
                <div className="carousel-section home-wide">
                    <Carousel />
                </div>
                <div className="container home-content mt-4">
                    <div className="home-section">
                        <QuickCategories />
                    </div>
                    <div className="home-section">
                        <PopularLeagues />
                    </div>
                    {popularLoading ? (
                        <p className="mt-4">Loading popular matches...</p>
                    ) : (
                        <>
                            <div className="home-section">
                                <PopularMatchesSection title="ФУТБОЛ ПОПУЛЯРНЕ" icon={fIcon}>
                                    {footballGroups.map((g) => (
                                        <CountryLeagueBlock
                                            key={`${g.country}-${g.league}`}
                                            country={g.country}
                                            league={g.league}
                                            items={g.items}
                                        />
                                    ))}
                                </PopularMatchesSection>
                            </div>
                            <div className="home-section">
                                <PopularMatchesSection title="ТЕНІС ПОПУЛЯРНЕ" icon={tIcon}>
                                    {tennisGroups.map((g) => (
                                        <CountryLeagueBlock
                                            key={`${g.country}-${g.league}`}
                                            country={g.country}
                                            league={g.league}
                                            items={g.items}/>
                                    ))}
                                </PopularMatchesSection>
                            </div>
                        </>
                    )}
                    <div className="home-section">
                        <SectionTitle title="ВИБРАНІ ІГРИ" />
                        <GameCategoryRow
                            items={[
                                { label: "ПОКЕР", iconSrc: pokerIcon, route: "/catalog?game=poker" },
                                { label: "РУЛЕТКА", iconSrc: rouletteIcon, route: "/catalog?game=roulette" },
                                { label: "СЛОТИ", iconSrc: slotsIcon, route: "/catalog?game=slots" },
                                { label: "БЛЕКДЖЕК", iconSrc: blackjackIcon, route: "/catalog?game=blackjack" },
                            ]}
                        />
                    </div>
                    <div className="home-section">
                        <SectionTitle title="НОВІ ІГРИ" />
                        <TileRow count={5} />
                    </div>

                    <div className="home-section">
                        <SectionTitle title="ЛАЙВ-КАЗИНО" />
                        <TileRow count={5} />
                    </div>

                    <div className="home-section">
                        <SectionTitle title="ПОПУЛЯРНІ ІГРИ" />
                        <TileRow count={5} />
                    </div>
                </div>
            </div>
            <InfoFooterBlock />
        </div>
    );
};

export default HomePage;
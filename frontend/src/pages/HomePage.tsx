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
import nw1 from "../assets/icons/nw1.png";
import nw2 from "../assets/icons/nw2.png";
import nw3 from "../assets/icons/nw3.png";
import nw4 from "../assets/icons/nw4.png";
import nw5 from "../assets/icons/nw5.png";
import nw6 from "../assets/icons/nw6.png";
import nw7 from "../assets/icons/nw7.png";
import nw8 from "../assets/icons/nw8.png";
import nw9 from "../assets/icons/nw9.png";

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
            time:
                m.isLive || !m.startTime
                    ? undefined
                    : new Date(m.startTime).toLocaleTimeString("uk-UA", {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
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

    const basketballGroups = useMemo<Group[]>(() => {
        const basketball = popularMatches.filter((m) => m.sportKey === "basketball");
        const groups = groupByCountryLeague(basketball);
        return groups.slice(0, 2);
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
                                <PopularMatchesSection title="БАСКЕТБОЛ ПОПУЛЯРНЕ" icon={tIcon}>
                                    {basketballGroups.map((g) => (
                                        <CountryLeagueBlock
                                            key={`${g.country}-${g.league}`}
                                            country={g.country}
                                            league={g.league}
                                            items={g.items}
                                        />
                                    ))}
                                </PopularMatchesSection>
                            </div>
                        </>
                    )}

                    <div className="home-section">
                        <SectionTitle title="ВИБРАНІ ІГРИ" />
                        <GameCategoryRow
                            items={[
                                { label: "ПОКЕР", iconSrc: pokerIcon, route: "/games/poker" },
                                { label: "РУЛЕТКА", iconSrc: rouletteIcon, route: "/games/roulette" },
                                { label: "СЛОТИ", iconSrc: slotsIcon, route: "/games/slots" },
                                { label: "БЛЕКДЖЕК", iconSrc: blackjackIcon, route: "/games/blackjack" },
                            ]}
                        />
                    </div>

                    <div className="home-section">
                        <SectionTitle title="НОВІ ІГРИ" icon={pokerIcon} />
                        <TileRow
                            items={[
                                { image: nw1, title:"BoxOfRa", route:"/games/box-of-ra" },
                                { image: nw2, title: "nw2" },
                                { image: nw3, title: "nw3" },
                                { image: nw4, title: "nw4" },
                                { image: nw5, title: "nw5" },
                            ]}
                        />
                    </div>

                    <div className="home-section">
                        <SectionTitle title="ЛАЙВ-КАЗИНО" icon={pokerIcon} />
                        <TileRow
                            items={[
                                { image: nw6, title: "nw6" },
                                { image: nw7, title: "nw7" },
                                { image: nw8, title: "nw8" },
                                { image: nw9, title: "nw9" },
                                { image: nw4, title: "nw4" },
                            ]}
                        />
                    </div>

                    <div className="home-section">
                        <SectionTitle title="ПОПУЛЯРНІ ІГРИ" icon={pokerIcon} />
                        <TileRow
                            items={[
                                { image: nw2, title: "popular2" },
                                { image: nw5, title: "popular5" },
                                { image: nw1, title: "popular1" },
                                { image: nw3, title: "popular3" },
                                { image: nw7, title: "popular7" },
                            ]}
                        />
                    </div>
                </div>
            </div>
            <InfoFooterBlock />
        </div>
    );
};

export default HomePage;
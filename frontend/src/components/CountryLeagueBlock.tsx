import "../styles/CountryLeagueBlock.css";
import GameCard from "./GameCard";

type Item = {
    id: number;
    homeTeam: string;
    awayTeam: string;
    homeOdd: number;
    awayOdd: number;
    time?: string;
};

type Props = {
    country: string;
    league: string;
    items: Item[];
};

const CountryLeagueBlock = ({ country, league, items }: Props) => {
    return (
        <div className="clb">
            <div className="clb__meta">
                <b className="clb__country">{country}</b>
                <b className="clb__league">{league}</b>
            </div>
            <div className="clb__row">
                {items.slice(0, 3).map((m) => (
                    <GameCard
                        key={m.id}
                        homeTeam={m.homeTeam}
                        awayTeam={m.awayTeam}
                        homeOdd={m.homeOdd}
                        awayOdd={m.awayOdd}
                        time={m.time}
                    />
                ))}
            </div>
        </div>
    );
};

export default CountryLeagueBlock;
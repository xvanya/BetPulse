import "../styles/GameCard.css";

type Props = {
    homeTeam: string;
    awayTeam: string;
    homeOdd: number;
    awayOdd: number;
    time?: string;
};

const GameCard = ({ homeTeam, awayTeam, homeOdd, awayOdd, time }: Props) => {
    const isLive = !time;

    return (
        <div className="gameCard">
            <div className={isLive ? "gameCard__live" : "gameCard__time"}>
                <b className={isLive ? "gameCard__liveText" : "gameCard__timeText"}>
                    {isLive ? "LIVE" : time}
                </b>
            </div>

            <div className="gameCard__right">
                <div className="gameCard__row">
                    <b className="gameCard__team">{homeTeam}</b>
                    <div className="gameCard__odd">
                        <b className="gameCard__oddText">{homeOdd}</b>
                    </div>
                </div>

                <div className="gameCard__row">
                    <b className="gameCard__team">{awayTeam}</b>
                    <div className="gameCard__odd">
                        <b className="gameCard__oddText">{awayOdd}</b>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameCard;
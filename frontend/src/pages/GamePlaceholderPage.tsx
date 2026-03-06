import { useParams } from "react-router-dom";
import "./GamePlaceholderPage.css";

const titles: Record<string, string> = {
    poker: "Покер",
    roulette: "Рулетка",
    slots: "Слоти",
    blackjack: "Блекджек",
};

const GamePlaceholderPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const title = slug ? titles[slug] ?? slug : "Гра";
    return (
        <div className="game-placeholder-page">
            <div className="game-placeholder-card">
                <div className="game-placeholder-badge">СКОРО</div>
                <h1>{title}</h1>
                <p>Ще не реалізовано</p>
            </div>
        </div>
    );
};

export default GamePlaceholderPage;
import { useNavigate } from "react-router-dom";
import "../styles/GameCategoryRow.css";

type Item = {
    label: string;
    iconSrc: string;
    route: string;
};

type Props = {
    items: Item[];
};

const GameCategoryRow = ({ items }: Props) => {
    const navigate = useNavigate();

    return (
        <div className="gameCatRow">
            {items.map((x) => (
                <button
                    key={x.label}
                    className="gameCatRow__btn"
                    type="button"
                    onClick={() => navigate(x.route)}
                >
                    <img className="gameCatRow__icon" src={x.iconSrc} alt="" />
                    <span className="gameCatRow__text">{x.label}</span>
                </button>
            ))}
        </div>
    );
};

export default GameCategoryRow;
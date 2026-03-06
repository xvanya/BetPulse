import { useNavigate } from "react-router-dom";
import "../styles/TileRow.css";

type TileItem = {
    image?: string;
    title?: string;
    route?: string;
};

type Props = {
    count?: number;
    items?: TileItem[];
};

const TileRow = ({ count = 5, items }: Props) => {
    const navigate = useNavigate();
    const preparedItems: TileItem[] =
        items && items.length > 0
            ? items
            : Array.from({ length: count }).map(() => ({
                image: undefined,
                title: undefined,
                route: undefined,
            }));
    return (
        <div className="tile-row">
            {preparedItems.map((item, index) => {
                const clickable = Boolean(item.route);
                return (
                    <div
                        key={index}
                        className={`tile-row__item ${clickable ? "tile-row__item--clickable" : ""}`}
                        onClick={clickable ? () => navigate(item.route!) : undefined}>
                        {item.image ? (
                            <img src={item.image} alt={item.title ?? `tile-${index}`} className="tile-row__image"/>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
};

export default TileRow;
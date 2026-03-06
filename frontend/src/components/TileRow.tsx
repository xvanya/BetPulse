import "../styles/TileRow.css";

type TileItem = {
    image?: string;
    title?: string;
};

type Props = {
    count?: number;
    items?: TileItem[];
};

const TileRow = ({ count = 5, items }: Props) => {
    const preparedItems =
        items && items.length > 0
            ? items
            : Array.from({ length: count }).map(() => ({}));

    return (
        <div className="tile-row">
            {preparedItems.map((item, index) => (
                <div key={index} className="tile-row__item">
                    {item.image ? (
                        <img
                            src={item.image}
                            alt={item.title ?? `tile-${index}`}
                            className="tile-row__image"
                        />
                    ) : null}
                </div>
            ))}
        </div>
    );
};

export default TileRow;
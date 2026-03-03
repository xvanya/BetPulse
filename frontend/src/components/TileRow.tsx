import "../styles/TileRow.css";

type Props = {
    count?: number;
};

const TileRow = ({ count = 5 }: Props) => {
    return (
        <div className="tileRow">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="tileRow__tile" />
            ))}
        </div>
    );
};

export default TileRow;
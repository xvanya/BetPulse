import { useNavigate } from "react-router-dom";
import "../styles/QuickCategories.css";
import vIcon from "../assets/icons/v.png";
import fIcon from "../assets/icons/f.png";
import bIcon from "../assets/icons/b.png";
import tIcon from "../assets/icons/t.png";

type Category = {
    label: string;
    route: string;
    icon: string;
};

const categories: Category[] = [
    { label: "ВОЛЕЙБОЛ", route: "/catalog?sport=volleyball", icon: vIcon },
    { label: "ФУТБОЛ", route: "/catalog?sport=football", icon: fIcon },
    { label: "БАСКЕТБОЛ", route: "/catalog?sport=basketball", icon: bIcon },
    { label: "ТЕНІС", route: "/catalog?sport=tennis", icon: tIcon },
];

const QuickCategories = () => {
    const navigate = useNavigate();

    return (
        <section className="qc">
            <div className="sectionHeader">
                <h2>ШВИДКІ КАТЕГОРІЇ</h2>
            </div>
            <div className="qcGrid">
                {categories.map((c) => (
                    <button
                        key={c.label}
                        className="qcCard"
                        onClick={() => navigate(c.route)}
                        type="button">
                        <img src={c.icon} alt={c.label} className="qcIconImg" />
                        <span className="qcText">{c.label}</span>
                    </button>
                ))}
            </div>
        </section>
    );
};

export default QuickCategories;
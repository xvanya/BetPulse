import type { FunctionComponent, ReactNode } from "react";
import "../styles/PopularSection.css";

type Props = {
    title: string;
    icon: string;
    children: ReactNode;
};

const PopularMatchesSection: FunctionComponent<Props> = ({ title, icon, children }) => {
    return (
        <section className="popularSection">
            <div className="popularSection__titleRow">
                <img className="popularSection__icon" src={icon} alt="" />
                <h3 className="popularSection__title">{title}</h3>
            </div>
            {children}
        </section>
    );
};

export default PopularMatchesSection;
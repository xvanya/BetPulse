import "../styles/SectionTitle.css";

type Props = {
    title: string;
    iconSrc?: string;
};

const SectionTitle = ({ title, iconSrc }: Props) => {
    return (
        <div className="sectionTitle">
            {iconSrc ? (
                <img className="sectionTitle__icon" src={iconSrc} alt="" />
            ) : (
                <span className="sectionTitle__dot" />
            )}
            <h3 className="sectionTitle__text">{title}</h3>
        </div>
    );
};

export default SectionTitle;
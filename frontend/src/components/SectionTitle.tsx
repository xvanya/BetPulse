import "../styles/SectionTitle.css";

type Props = {
    title: string;
    icon?: string;
};

const SectionTitle = ({ title, icon }: Props) => {
    return (
        <div className="section-title">
            {icon && <img src={icon} className="section-title__icon" alt={title} />}
            <b className="b">{title}</b>
        </div>
    );
};

export default SectionTitle;
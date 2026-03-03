import "../styles/PopularLeagues.css";

const leaguesRow1 = ["Чемпіонів УЄФА", "Європи УЄФА", "Прем’єр Ліга", "Ла Ліга"];
const leaguesRow2 = ["Серія A", "Бундесліга", "Ліга 1", "Кубок Іспанії"];

const PopularLeagues = () => {
    return (
        <section className="pl">
            <div className="pl__header">
                <b className="pl__title">ПОПУЛЯРНІ ЛІГИ</b>
            </div>
            <div className="pl__grid">
                <div className="pl__row">
                    {leaguesRow1.map((x) => (
                        <button key={x} className="pl__btn" type="button">
                            <span className="pl__btnText">{x}</span>
                        </button>
                    ))}
                </div>
                <div className="pl__row">
                    {leaguesRow2.map((x) => (
                        <button key={x} className="pl__btn" type="button">
                            <span className="pl__btnText">{x}</span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PopularLeagues;
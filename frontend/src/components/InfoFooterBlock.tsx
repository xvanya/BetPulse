import "../styles/InfoFooterBlock.css";
import bpLogo from "../assets/icons/Frame7.svg";
import tg from "../assets/icons/telegram.svg";
import ig from "../assets/icons/instagram.svg";
import msg from "../assets/icons/messenger.svg";
import yt from "../assets/icons/youtube.svg";
import tt from "../assets/icons/tiktok.svg";
import x from "../assets/icons/x.svg";
import visa from "../assets/icons/visa.svg";
import mc from "../assets/icons/mastercard.svg";
import gpay from "../assets/icons/gpay.svg";
import apay from "../assets/icons/apay.svg";

const InfoFooterBlock = () => {
    return (
        <section className="infoFooter">
            <div className="infoFooter__top">
                <div className="infoFooter__topText">
                    <span className="infoFooter__bet">“BET</span>
                    <span className="infoFooter__pulse">PULSE</span>
                    <span className="infoFooter__bet">”</span>{" "}
                    належить до переліку ліцензійних закладів в Україні. Проста реєстрація на сайті відкриває доступ
                    до гральних автоматів онлайн, також дозволяє робити ставки на спорт, кіберспорт, грати в онлайн
                    рулетку. Для цього користувачу необхідно заповнити форму для реєстрації, пройти верифікацію та
                    ідентифікацію.
                </div>
            </div>
            <div className="infoFooter__cols">
                <div className="infoFooter__col" style={{ width: 131 }}>
                    <div className="infoFooter__colTitle">ПРО НАС</div>
                    <div className="infoFooter__links">
                        <a className="infoFooter__link" href="/about">Про нас</a>
                        <a className="infoFooter__link" href="/news">Новини</a>
                        <a className="infoFooter__link" href="/offer">Договір оферти</a>
                        <a className="infoFooter__link" href="/careers">Вакансії</a>
                    </div>
                </div>
                <div className="infoFooter__col" style={{ width: 203 }}>
                    <div className="infoFooter__colTitle">ДОПОМОГА</div>
                    <div className="infoFooter__links">
                        <a className="infoFooter__link" href="/faq">Поширені запитання</a>
                        <a className="infoFooter__link" href="/payments">Поповнення/Виведення</a>
                        <a className="infoFooter__link" href="/calculator">Калькулятор систем</a>
                        <a className="infoFooter__link" href="/contact">Зв’язатися з нами</a>
                    </div>
                </div>
                <div className="infoFooter__col" style={{ width: 229 }}>
                    <div className="infoFooter__colTitle">ПРАВИЛА</div>
                    <div className="infoFooter__links">
                        <a className="infoFooter__link" href="/rules">Правила організатора</a>
                        <a className="infoFooter__link" href="/sports-resources">Ресурси по видам спорту</a>
                        <a className="infoFooter__link" href="/license">Ліцензія</a>
                        <a className="infoFooter__link" href="/privacy">Політика конфіденційності</a>
                        <a className="infoFooter__link" href="/responsible">Відповідальна гра</a>
                        <a className="infoFooter__link" href="/loyalty">Програма лояльності</a>
                    </div>
                </div>
                <div className="infoFooter__col" style={{ width: 236 }}>
                    <div className="infoFooter__colTitle">ПЛАТІЖНІ МЕТОДИ</div>
                    <div className="infoFooter__pay">
                        <div className="infoFooter__payRow">
                            <a className="infoFooter__iconLink" href="https://www.visa.com/" target="_blank" rel="noreferrer">
                                <img src={visa} alt="VISA" />
                            </a>
                            <a className="infoFooter__iconLink" href="https://www.mastercard.com/" target="_blank" rel="noreferrer">
                                <img src={mc} alt="Mastercard" />
                            </a>
                        </div>
                        <div className="infoFooter__payRow">
                            <a className="infoFooter__iconLink" href="https://pay.google.com/" target="_blank" rel="noreferrer">
                                <img src={gpay} alt="Google Pay" />
                            </a>
                            <a className="infoFooter__iconLink" href="https://www.apple.com/apple-pay/" target="_blank" rel="noreferrer">
                                <img src={apay} alt="Apple Pay" />
                            </a>
                        </div>
                    </div>
                </div>
                <div className="infoFooter__col" style={{ width: 343 }}>
                    <div className="infoFooter__colTitle">КОНТАКТИ</div>
                    <div className="infoFooter__contacts">
                        <div className="infoFooter__contactBlock">
                            <a className="infoFooter__link" href="tel:+380800123456">
                                0 (800) 123 456 (безкоштовно по Україні)
                            </a>
                            <a className="infoFooter__link" href="mailto:support@betpulse.ua">
                                support@betpulse.ua
                            </a>
                        </div>
                        <div className="infoFooter__contactBlock" style={{ width: 155 }}>
                            <div>Співпраця</div>
                            <a className="infoFooter__link" href="mailto:offer@betpulse.ua">
                                offer@betpulse.ua
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="infoFooter__social">
                <a className="infoFooter__socialLink" href="https://t.me/" target="_blank" rel="noreferrer">
                    <img src={tg} alt="Telegram" />
                </a>
                <a className="infoFooter__socialLink" href="https://www.instagram.com/" target="_blank" rel="noreferrer">
                    <img src={ig} alt="Instagram" />
                </a>
                <a className="infoFooter__socialLink" href="https://www.messenger.com/" target="_blank" rel="noreferrer">
                    <img src={msg} alt="Messenger" />
                </a>
                <a className="infoFooter__socialLink" href="https://www.youtube.com/" target="_blank" rel="noreferrer">
                    <img src={yt} alt="YouTube" />
                </a>
                <a className="infoFooter__socialLink" href="https://www.tiktok.com/" target="_blank" rel="noreferrer">
                    <img src={tt} alt="TikTok" />
                </a>
                <a className="infoFooter__socialLink" href="https://x.com/" target="_blank" rel="noreferrer">
                    <img src={x} alt="X" />
                </a>
            </div>
            <div className="infoFooter__license">
                <div>
                    • Ліцензія на провадження діяльності з організації та проведення азартних ігор казино в мережі Інтернет
                    від 31.05.2021 року, видана ТОВ «БЕТПУЛЬС ГРУП» на підставі Рішення Комісії з регулювання азартних ігор
                    та лотерей від 31.05.2021 р. за № 314
                </div>
                <div>
                    • Ліцензія на провадження діяльності з організації та проведення азартних ігор покер у мережі Інтернет
                    від 31.05.2021 року, видана ТОВ «БЕТПУЛЬС ГРУП» на підставі Рішення Комісії з регулювання азартних ігор
                    та лотерей від 31.05.2021 р. за №315
                </div>
                <div>
                    • Ліцензія на провадження діяльності з організації та проведення букмекерської діяльності від 31.01.2022
                    року, видана ТОВ «БЕТПУЛЬС ГРУП» на підставі Рішення Комісії з регулювання азартних ігор та лотерей від
                    18.01.2022 р. за №15
                </div>
                <div>
                    Загальний середній відсоток виграшу (теоретичне повернення гравцю) становить від 94% до 98% і
                    встановлюється розробником по кожній грі окремо.
                </div>
                <div>
                    Всі права інтелектуальної власності на символіку спортивних команд належать законним правовласникам та
                    підлягають правовій охороні згідно з чинним законодавством України і міжнародно-правовим нормам.
                </div>
                <div>
                    ТОВ БЕТПУЛЬС ГРУП засвідчує, що всі об&apos;єкти інтелектуальної власності розміщені на вебсайті
                    добросовісно, відповідно до чесних практик у комерційних справах.
                </div>
            </div>
            <div className="infoFooter__bottomRow">
                <div className="infoFooter__age">21+</div>
                <div className="infoFooter__years">2025–2026</div>
                <img className="infoFooter__bpLogo" src={bpLogo} alt="BP" />
            </div>
        </section>
    );
};

export default InfoFooterBlock;
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <article className="footer-feedback">
        <h4 className="footer-title">Жалобы и предложения</h4>
        <div className="form-group">
          <label htmlFor="contact" className="form-label">Email</label>
          <input type="email" name="contact" id="contact" className="form-input" required />
        </div>
        <div className="form-group">
          <label htmlFor="предложения" className="form-label">Ваши пожелания и жалобы</label>
          <input type="text" name="предложения" id="предложения" className="form-input" required />
        </div>
        <input type="submit" value="Отправить предложение" className="submit-btn" />
      </article>

      <h2 className="footer-main-title">Информация о сайте</h2>

      <div className="footer-content">
        <div className="footer-card">
          <a href="#" className="footer-logo-link">
            <img src="/assets/imgs/logo-no-bg-preview (carve.photos).png" alt="Логотип" className="footer-logo" />
          </a>
          <h3 className="footer-brand">Blueberries</h3>
          <p className="footer-description">Ваш лучший маркетплейс</p>
        </div>

        <div className="footer-card">
          <h4 className="footer-subtitle">Контактная информация</h4>
          <p className="footer-text">Адрес: г. Ростов-на-Дону, ул. Большая Садовая д. 77</p>
          <p className="footer-text">Телефон: +7 (123) 456-78-90</p>
          <p className="footer-text">Email: info@startvapeshop.ru</p>
        </div>

        <div className="footer-card">
          <h4 className="footer-subtitle">Время работы технической поддержки:</h4>
          <table className="footer-table">
            <tr>
              <th className="table-header">Дни недели</th>
              <th className="table-header">Время работы</th>
            </tr>
            <tr>
              <th className="table-header">ПН-ПТ</th>
              <th className="table-data">6:00-23:00</th>
            </tr>
            <tr>
              <th className="table-header">СБ-ВС</th>
              <th className="table-data">10:00-22:00</th>
            </tr>
          </table>
        </div>

        <div className="footer-card">
          <h4 className="footer-subtitle">Мы в соцсетях</h4>
          <div className="social-links">
            <a href="#" className="social-link">VK</a>
            <a href="#" className="social-link">Telegram</a>
            <a href="#" className="social-link">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer


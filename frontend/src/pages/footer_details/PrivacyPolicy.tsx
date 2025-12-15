import React from "react";
import { useTranslation } from 'react-i18next';

const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation();
  return (
    <main
      style={{
        maxWidth: "960px",
        margin: "80px auto 0", // 상단 여백 추가로 헤더에 가리지 않도록 조정
        padding: "40px 20px",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>{t('privacy.title')}</h1>
      <hr /><br /><br />
      <p style={{ marginBottom: "1rem", color: "#555" }}>
        {t('privacy.intro')}
      </p>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>{t('privacy.article1.title')}</h2>
        <p>
          {t('privacy.article1.intro')}
        </p>
        <ul style={{ marginTop: "0.5rem", marginLeft: "1.25rem", listStyle: "disc" }}>
          <li>{t('privacy.article1.item1')}</li>
          <li>{t('privacy.article1.item2')}</li>
          <li>{t('privacy.article1.item3')}</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>{t('privacy.article2.title')}</h2>
        <ul style={{ marginTop: "0.5rem", marginLeft: "1.25rem", listStyle: "disc" }}>
          <li>{t('privacy.article2.item1')}</li>
          <li>{t('privacy.article2.item2')}</li>
          <li>{t('privacy.article2.item3')}</li>
          <li>{t('privacy.article2.item4')}</li>
          <li>{t('privacy.article2.item5')}</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>{t('privacy.article3.title')}</h2>
        <p>
          {t('privacy.article3.intro')}
        </p>
        <ul style={{ marginTop: "0.5rem", marginLeft: "1.25rem", listStyle: "disc" }}>
          <li>{t('privacy.article3.item1')}</li>
          <li>{t('privacy.article3.item2')}</li>
          <li>{t('privacy.article3.item3')}</li>
          <li>{t('privacy.article3.item4')}</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>{t('privacy.article4.title')}</h2>
        <p>
          {t('privacy.article4.content')}
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>{t('privacy.article5.title')}</h2>
        <ul style={{ marginTop: "0.5rem", marginLeft: "1.25rem", listStyle: "disc" }}>
          <li>{t('privacy.article5.item1')}</li>
          <li>{t('privacy.article5.item2')}</li>
          <li>{t('privacy.article5.item3')}</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>{t('privacy.article6.title')}</h2>
        <p>
          {t('privacy.article6.content')}
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>{t('privacy.article7.title')}</h2>
        <p>
          {t('privacy.article7.content')}
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>{t('privacy.article8.title')}</h2>
        <p>
          {t('privacy.article8.intro')}
        </p>
        <ul style={{ marginTop: "0.5rem", marginLeft: "1.25rem", listStyle: "disc" }}>
          <li>{t('privacy.article8.item1')}</li>
          <li>{t('privacy.article8.item2')}</li>
          <li>{t('privacy.article8.item3')}</li>
        </ul>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>{t('privacy.article9.title')}</h2>
        <p>
          {t('privacy.article9.content')}
        </p>
        <p style={{ marginTop: "0.5rem", color: "#777", fontSize: "0.9rem" }}>
          {t('privacy.article9.date')}
        </p>
      </section>
    </main>
  );
};

export default PrivacyPolicy;

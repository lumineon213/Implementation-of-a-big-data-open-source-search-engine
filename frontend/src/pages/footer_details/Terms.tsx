import React from "react";
import { useTranslation } from 'react-i18next';

const Terms: React.FC = () => {
  const { t } = useTranslation();
  return (
    <main
      style={{
        maxWidth: "960px",
        margin: "80px auto 0",
        padding: "40px 20px",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>{t('terms.title')}</h1>
      <hr /><br /><br />
      <p style={{ marginBottom: "1rem", color: "#555" }}>
        {t('terms.intro')}
      </p>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>{t('terms.article1.title')}</h2>
        <p>
          {t('terms.article1.content')}
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>{t('terms.article2.title')}</h2>
        <ul style={{ marginTop: "0.5rem", marginLeft: "1.25rem", listStyle: "disc" }}>
          <li>{t('terms.article2.item1')}</li>
          <li>{t('terms.article2.item2')}</li>
          <li>{t('terms.article2.item3')}</li>
          <li>{t('terms.article2.item4')}</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>{t('terms.article3.title')}</h2>
        <ul style={{ marginTop: "0.5rem", marginLeft: "1.25rem", listStyle: "disc" }}>
          <li>{t('terms.article3.item1')}</li>
          <li>{t('terms.article3.item2')}</li>
          <li>{t('terms.article3.item3')}</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>{t('terms.article4.title')}</h2>
        <ul style={{ marginTop: "0.5rem", marginLeft: "1.25rem", listStyle: "disc" }}>
          <li>{t('terms.article4.item1')}</li>
          <li>{t('terms.article4.item2')}</li>
          <li>{t('terms.article4.item3')}</li>
          <li>{t('terms.article4.item4')}</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>{t('terms.article5.title')}</h2>
        <ul style={{ marginTop: "0.5rem", marginLeft: "1.25rem", listStyle: "disc" }}>
          <li>{t('terms.article5.item1')}</li>
          <li>{t('terms.article5.item2')}</li>
          <li>{t('terms.article5.item3')}</li>
          <li>{t('terms.article5.item4')}</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>{t('terms.article6.title')}</h2>
        <p>
          {t('terms.article6.content')}
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>{t('terms.article7.title')}</h2>
        <p>
          {t('terms.article7.content')}
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>{t('terms.article8.title')}</h2>
        <p>
          {t('terms.article8.content')}
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>{t('terms.supplementary.title')}</h2>
        <p style={{ marginBottom: "0.5rem" }}>{t('terms.supplementary.content')}</p>
      </section>
    </main>
  );
};

export default Terms;

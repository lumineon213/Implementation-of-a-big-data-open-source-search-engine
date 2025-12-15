import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ko from '../locales/ko.json';
import en from '../locales/en.json';

const resources = {
  ko: {
    translation: ko,
  },
  en: {
    translation: en,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'ko', // 기본 언어는 한국어
    fallbackLng: 'ko',
    interpolation: {
      escapeValue: false, // React는 이미 XSS 보호가 되어 있음
    },
  });

export default i18n;




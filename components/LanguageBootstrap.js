import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { changeLanguage } from '../translations/I18n';

const LanguageBootstrap = ({ children }) => {
  const language = useSelector(({ loginReducer }) => loginReducer.language || 'th');

  useEffect(() => {
    changeLanguage(language === 'en' ? 'en' : 'th');
  }, [language]);

  return children;
};

export default LanguageBootstrap;

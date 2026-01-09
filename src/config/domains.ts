// Configuração de domínios para separar Site (flowdent.com.br) do App (app.flowdent.com.br)

export const DOMAINS = {
  SITE: 'flowdent.com.br',
  APP: 'app.flowdent.com.br',
  SITE_URL: 'https://flowdent.com.br',
  APP_URL: 'https://app.flowdent.com.br',
};

// Em desenvolvimento, localhost age como o domínio do APP
export const isAppDomain = (): boolean => {
  const hostname = window.location.hostname;
  return (
    hostname === DOMAINS.APP ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1'
  );
};

export const isSiteDomain = (): boolean => {
  return !isAppDomain();
};

// Gera URLs absolutas para o domínio do App
export const getAppUrl = (path: string = ''): string => {
  // Em desenvolvimento, usa URL relativa
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return path;
  }
  return `${DOMAINS.APP_URL}${path}`;
};

// Gera URLs absolutas para o domínio do Site
export const getSiteUrl = (path: string = ''): string => {
  // Em desenvolvimento, usa URL relativa
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return path;
  }
  return `${DOMAINS.SITE_URL}${path}`;
};

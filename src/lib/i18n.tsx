import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const dict = {
  en: {
    home: "Home", compose: "Compose", notifications: "Notifications", profile: "Profile",
    redeem: "Redeem token", signin: "Sign in", signout: "Sign out", post: "Post",
    share: "Share", search: "Search", settings: "Settings", theme: "Theme",
    language: "Language", generate_token: "Generate token", premium_only: "Verified only",
    follow: "Follow", following: "Following", edit_profile: "Edit profile",
    whats_on_mind: "What's on your mind?", new_post: "New post", new_story: "New story",
    diamonds: "Diamonds", grid: "Grid", list: "List",
  },
  es: {
    home: "Inicio", compose: "Crear", notifications: "Notificaciones", profile: "Perfil",
    redeem: "Canjear token", signin: "Entrar", signout: "Salir", post: "Publicar",
    share: "Compartir", search: "Buscar", settings: "Ajustes", theme: "Tema",
    language: "Idioma", generate_token: "Generar token", premium_only: "Solo verificados",
    follow: "Seguir", following: "Siguiendo", edit_profile: "Editar perfil",
    whats_on_mind: "¿Qué estás pensando?", new_post: "Nueva publicación", new_story: "Nueva historia",
    diamonds: "Diamantes", grid: "Cuadrícula", list: "Lista",
  },
  fr: {
    home: "Accueil", compose: "Composer", notifications: "Notifications", profile: "Profil",
    redeem: "Utiliser un jeton", signin: "Connexion", signout: "Déconnexion", post: "Publier",
    share: "Partager", search: "Rechercher", settings: "Paramètres", theme: "Thème",
    language: "Langue", generate_token: "Générer un jeton", premium_only: "Vérifiés uniquement",
    follow: "Suivre", following: "Abonné", edit_profile: "Modifier le profil",
    whats_on_mind: "Quoi de neuf ?", new_post: "Nouveau post", new_story: "Nouvelle story",
    diamonds: "Diamants", grid: "Grille", list: "Liste",
  },
  de: {
    home: "Start", compose: "Schreiben", notifications: "Mitteilungen", profile: "Profil",
    redeem: "Token einlösen", signin: "Anmelden", signout: "Abmelden", post: "Posten",
    share: "Teilen", search: "Suchen", settings: "Einstellungen", theme: "Thema",
    language: "Sprache", generate_token: "Token erzeugen", premium_only: "Nur verifiziert",
    follow: "Folgen", following: "Folge ich", edit_profile: "Profil bearbeiten",
    whats_on_mind: "Was denkst du?", new_post: "Neuer Post", new_story: "Neue Story",
    diamonds: "Diamanten", grid: "Raster", list: "Liste",
  },
  pt: {
    home: "Início", compose: "Criar", notifications: "Notificações", profile: "Perfil",
    redeem: "Resgatar token", signin: "Entrar", signout: "Sair", post: "Postar",
    share: "Compartilhar", search: "Buscar", settings: "Ajustes", theme: "Tema",
    language: "Idioma", generate_token: "Gerar token", premium_only: "Só verificados",
    follow: "Seguir", following: "Seguindo", edit_profile: "Editar perfil",
    whats_on_mind: "No que está pensando?", new_post: "Novo post", new_story: "Novo story",
    diamonds: "Diamantes", grid: "Grade", list: "Lista",
  },
  hi: {
    home: "होम", compose: "लिखें", notifications: "सूचनाएं", profile: "प्रोफ़ाइल",
    redeem: "टोकन रिडीम करें", signin: "साइन इन", signout: "साइन आउट", post: "पोस्ट",
    share: "साझा करें", search: "खोजें", settings: "सेटिंग्स", theme: "थीम",
    language: "भाषा", generate_token: "टोकन बनाएँ", premium_only: "केवल वेरिफ़ाइड",
    follow: "फ़ॉलो", following: "फ़ॉलोइंग", edit_profile: "प्रोफ़ाइल संपादित करें",
    whats_on_mind: "क्या सोच रहे हैं?", new_post: "नया पोस्ट", new_story: "नई स्टोरी",
    diamonds: "डायमंड्स", grid: "ग्रिड", list: "सूची",
  },
  ja: {
    home: "ホーム", compose: "投稿", notifications: "通知", profile: "プロフィール",
    redeem: "トークンを使う", signin: "ログイン", signout: "ログアウト", post: "投稿する",
    share: "シェア", search: "検索", settings: "設定", theme: "テーマ",
    language: "言語", generate_token: "トークン生成", premium_only: "認証済みのみ",
    follow: "フォロー", following: "フォロー中", edit_profile: "プロフィール編集",
    whats_on_mind: "いまどうしてる？", new_post: "新規投稿", new_story: "新規ストーリー",
    diamonds: "ダイヤ", grid: "グリッド", list: "リスト",
  },
} as const;

export type Lang = keyof typeof dict;
export const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "hi", label: "हिन्दी" },
  { code: "ja", label: "日本語" },
];

type Theme = "dark" | "light" | "aurora" | "gold";
const Ctx = createContext<{
  t: (k: keyof typeof dict["en"]) => string;
  lang: Lang; setLang: (l: Lang) => void;
  theme: Theme; setTheme: (t: Theme) => void;
}>({ t: (k) => k, lang: "en", setLang: () => {}, theme: "dark", setTheme: () => {} });

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const l = (localStorage.getItem("lumera.lang") as Lang) || "en";
    const t = (localStorage.getItem("lumera.theme") as Theme) || "dark";
    setLangState(l); setThemeState(t);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.remove("theme-dark", "theme-light", "theme-aurora", "theme-gold", "dark");
    root.classList.add(`theme-${theme}`);
    if (theme !== "light") root.classList.add("dark");
    root.setAttribute("lang", lang);
  }, [theme, lang]);

  const setLang = (l: Lang) => { setLangState(l); if (typeof localStorage !== "undefined") localStorage.setItem("lumera.lang", l); };
  const setTheme = (t: Theme) => { setThemeState(t); if (typeof localStorage !== "undefined") localStorage.setItem("lumera.theme", t); };
  const t = (k: keyof typeof dict["en"]) => (dict[lang] as any)[k] ?? dict.en[k];

  return <Ctx.Provider value={{ t, lang, setLang, theme, setTheme }}>{children}</Ctx.Provider>;
}

export const usePrefs = () => useContext(Ctx);

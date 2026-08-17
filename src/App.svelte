<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import FlipUnit from "./lib/FlipUnit.svelte";

  type Theme = "dark" | "light" | "mechanical" | "neon";
  type ClockSize = "compact" | "comfortable" | "large";
  type Language = "zh-CN" | "en-US" | "ja-JP" | "ko-KR" | "es-ES" | "fr-FR" | "ru-RU";

  type ClockSettings = {
    hour12: boolean;
    showSeconds: boolean;
    screensaver: boolean;
    showDateInSpecialMode: boolean;
    showHourLabelInSpecialMode: boolean;
    showMinuteLabelInSpecialMode: boolean;
    showSecondLabelInSpecialMode: boolean;
    showDayPeriodInSpecialMode: boolean;
    theme: Theme;
    size: ClockSize;
    timeZone: string;
    language: Language;
  };

  type TimeSegment = {
    key: string;
    value: string;
    label: string;
  };

  type Copy = {
    appName: string;
    fullscreenEnter: string;
    fullscreenExit: string;
    statusTheme: string;
    statusDisplayLong: string;
    statusDisplayShort: string;
    statusHour12: string;
    statusHour24: string;
    settingsTitle: string;
    language: string;
    displayTitle: string;
    displayDescription: string;
    clockMode: string;
    mode12: string;
    mode24: string;
    seconds: string;
    show: string;
    hide: string;
    screensaver: string;
    screensaverDescription: string;
    screensaverExitHint: string;
    specialDisplayTitle: string;
    specialDisplayDescription: string;
    showDate: string;
    showHourLabel: string;
    showMinuteLabel: string;
    showSecondLabel: string;
    showDayPeriod: string;
    clockSize: string;
    fullscreen: string;
    on: string;
    off: string;
    themesTitle: string;
    themesDescription: string;
    timezoneTitle: string;
    timezoneDescription: string;
    presetCities: string;
    customTimezone: string;
    customTimezonePlaceholder: string;
    customTimezoneOption: string;
    currentZone: string;
    timezoneError: string;
    hours: string;
    minutes: string;
    secondsLabel: string;
    localTime: string;
    timezoneLabels: Record<string, string>;
    themeLabels: Record<Theme, string>;
    themeDescriptions: Record<Theme, string>;
    sizeLabels: Record<ClockSize, string>;
    languageLabels: Record<Language, string>;
  };

  const STORAGE_KEY = "flip-clock-settings";

  const languageOptions: Array<{ value: Language; label: string }> = [
    { value: "zh-CN", label: "中文" },
    { value: "en-US", label: "English" },
    { value: "ja-JP", label: "日本語" },
    { value: "ko-KR", label: "한국어" },
    { value: "es-ES", label: "Español" },
    { value: "fr-FR", label: "Français" },
    { value: "ru-RU", label: "Русский" },
  ];

  const translations: Record<Language, Copy> = {
    "zh-CN": {
      appName: "翻页时钟",
      fullscreenEnter: "进入全屏",
      fullscreenExit: "退出全屏",
      statusTheme: "主题",
      statusDisplayLong: "时:分:秒",
      statusDisplayShort: "时:分",
      statusHour12: "12 小时制",
      statusHour24: "24 小时制",
      settingsTitle: "设置",
      language: "语言",
      displayTitle: "显示",
      displayDescription: "调整读时方式和翻页尺寸。",
      clockMode: "时间制",
      mode12: "12 小时",
      mode24: "24 小时",
      seconds: "秒钟",
      show: "显示",
      hide: "隐藏",
      screensaver: "屏保模式",
      screensaverDescription: "开启后仅显示日期、时分秒和 AM/PM。",
      screensaverExitHint: "按 Esc 或点击时钟退出屏保",
      specialDisplayTitle: "全屏 / 屏保显示",
      specialDisplayDescription: "这些开关仅作用于全屏和屏保界面。",
      showDate: "显示日期",
      showHourLabel: "显示小时标签",
      showMinuteLabel: "显示分钟标签",
      showSecondLabel: "显示秒钟标签",
      showDayPeriod: "显示 AM/PM",
      clockSize: "时钟尺寸",
      fullscreen: "全屏",
      on: "开启",
      off: "关闭",
      themesTitle: "主题",
      themesDescription: "切换不同展示风格。",
      timezoneTitle: "时区",
      timezoneDescription: "可选预设城市，也可输入任意有效 IANA 时区。",
      presetCities: "预设城市",
      customTimezone: "自定义时区",
      customTimezonePlaceholder: "例如 Europe/Berlin",
      customTimezoneOption: "自定义时区",
      currentZone: "当前时区",
      timezoneError: "请输入有效的 IANA 时区，例如 Europe/Berlin。",
      hours: "小时",
      minutes: "分钟",
      secondsLabel: "秒钟",
      localTime: "本地时间",
      timezoneLabels: {
        local: "本地时间",
        UTC: "UTC",
        "America/Los_Angeles": "洛杉矶",
        "America/New_York": "纽约",
        "Europe/London": "伦敦",
        "Europe/Paris": "巴黎",
        "Asia/Tokyo": "东京",
        "Asia/Shanghai": "上海",
      },
      themeLabels: {
        dark: "夜幕",
        light: "纸面",
        mechanical: "黄铜",
        neon: "霓虹",
      },
      themeDescriptions: {
        dark: "深色玻璃与金属翻页质感",
        light: "适合明亮环境的暖色桌钟风格",
        mechanical: "复古黄铜与工坊阴影",
        neon: "适合副屏展示的高对比蓝光",
      },
      sizeLabels: {
        compact: "小",
        comfortable: "中",
        large: "大",
      },
      languageLabels: {
        "zh-CN": "中文",
        "en-US": "英语",
        "ja-JP": "日语",
        "ko-KR": "韩语",
        "es-ES": "西班牙语",
        "fr-FR": "法语",
        "ru-RU": "俄语",
      },
    },
    "en-US": {
      appName: "Flip Clock",
      fullscreenEnter: "Enter Fullscreen",
      fullscreenExit: "Exit Fullscreen",
      statusTheme: "theme",
      statusDisplayLong: "HH:MM:SS",
      statusDisplayShort: "HH:MM",
      statusHour12: "12-hour",
      statusHour24: "24-hour",
      settingsTitle: "Settings",
      language: "Language",
      displayTitle: "Display",
      displayDescription: "Choose the reading mode and card scale.",
      clockMode: "Clock mode",
      mode12: "12-hour",
      mode24: "24-hour",
      seconds: "Seconds",
      show: "Show",
      hide: "Hide",
      screensaver: "Screensaver mode",
      screensaverDescription: "Show only the date, time with seconds, and AM/PM.",
      screensaverExitHint: "Press Esc or click the clock to exit screensaver",
      specialDisplayTitle: "Fullscreen / Screensaver",
      specialDisplayDescription: "These toggles only affect fullscreen and screensaver views.",
      showDate: "Show date",
      showHourLabel: "Show hour label",
      showMinuteLabel: "Show minute label",
      showSecondLabel: "Show second label",
      showDayPeriod: "Show AM/PM",
      clockSize: "Clock size",
      fullscreen: "Fullscreen",
      on: "On",
      off: "Off",
      themesTitle: "Themes",
      themesDescription: "Switch the clock between presentation styles.",
      timezoneTitle: "Timezone",
      timezoneDescription: "Use a preset or enter any valid IANA timezone.",
      presetCities: "Preset cities",
      customTimezone: "Custom timezone",
      customTimezonePlaceholder: "Example: Europe/Berlin",
      customTimezoneOption: "Custom timezone",
      currentZone: "Current zone",
      timezoneError: "Use a valid IANA timezone like Europe/Berlin.",
      hours: "Hours",
      minutes: "Minutes",
      secondsLabel: "Seconds",
      localTime: "Local",
      timezoneLabels: {
        local: "Local",
        UTC: "UTC",
        "America/Los_Angeles": "Los Angeles",
        "America/New_York": "New York",
        "Europe/London": "London",
        "Europe/Paris": "Paris",
        "Asia/Tokyo": "Tokyo",
        "Asia/Shanghai": "Shanghai",
      },
      themeLabels: {
        dark: "Night",
        light: "Paper",
        mechanical: "Brass",
        neon: "Neon",
      },
      themeDescriptions: {
        dark: "Dark glass with steel flip cards",
        light: "Warm desk-clock tones for bright rooms",
        mechanical: "Vintage brass and workshop shadows",
        neon: "High-contrast cyan glow for side displays",
      },
      sizeLabels: {
        compact: "Small",
        comfortable: "Medium",
        large: "Large",
      },
      languageLabels: {
        "zh-CN": "Chinese",
        "en-US": "English",
        "ja-JP": "Japanese",
        "ko-KR": "Korean",
        "es-ES": "Spanish",
        "fr-FR": "French",
        "ru-RU": "Russian",
      },
    },
    "ja-JP": {
      appName: "フリップクロック",
      fullscreenEnter: "全画面表示",
      fullscreenExit: "全画面を終了",
      statusTheme: "テーマ",
      statusDisplayLong: "時:分:秒",
      statusDisplayShort: "時:分",
      statusHour12: "12時間表示",
      statusHour24: "24時間表示",
      settingsTitle: "設定",
      language: "言語",
      displayTitle: "表示",
      displayDescription: "時計表示とカードサイズを切り替えます。",
      clockMode: "時刻表示",
      mode12: "12時間",
      mode24: "24時間",
      seconds: "秒",
      show: "表示",
      hide: "非表示",
      screensaver: "スクリーンセーバー",
      screensaverDescription: "日付、時分秒、AM/PM のみ表示します。",
      screensaverExitHint: "Esc キーまたはクリックで終了",
      specialDisplayTitle: "全画面 / スクリーンセーバー",
      specialDisplayDescription: "これらの設定は全画面とスクリーンセーバー時のみ有効です。",
      showDate: "日付を表示",
      showHourLabel: "時ラベルを表示",
      showMinuteLabel: "分ラベルを表示",
      showSecondLabel: "秒ラベルを表示",
      showDayPeriod: "AM/PM を表示",
      clockSize: "時計サイズ",
      fullscreen: "全画面",
      on: "オン",
      off: "オフ",
      themesTitle: "テーマ",
      themesDescription: "表示スタイルを切り替えます。",
      timezoneTitle: "タイムゾーン",
      timezoneDescription: "プリセット都市を選ぶか、有効な IANA タイムゾーンを入力します。",
      presetCities: "プリセット都市",
      customTimezone: "カスタムタイムゾーン",
      customTimezonePlaceholder: "例: Europe/Berlin",
      customTimezoneOption: "カスタムタイムゾーン",
      currentZone: "現在のタイムゾーン",
      timezoneError: "Europe/Berlin のような有効な IANA タイムゾーンを入力してください。",
      hours: "時",
      minutes: "分",
      secondsLabel: "秒",
      localTime: "ローカル",
      timezoneLabels: {
        local: "ローカル",
        UTC: "UTC",
        "America/Los_Angeles": "ロサンゼルス",
        "America/New_York": "ニューヨーク",
        "Europe/London": "ロンドン",
        "Europe/Paris": "パリ",
        "Asia/Tokyo": "東京",
        "Asia/Shanghai": "上海",
      },
      themeLabels: {
        dark: "ナイト",
        light: "ペーパー",
        mechanical: "ブラス",
        neon: "ネオン",
      },
      themeDescriptions: {
        dark: "ダークガラスとメタルの反転カード",
        light: "明るい部屋向けの暖かな卓上時計",
        mechanical: "真鍮と工房の陰影を持つビンテージ風",
        neon: "サブディスプレイ向けの高コントラストな発光",
      },
      sizeLabels: {
        compact: "小",
        comfortable: "中",
        large: "大",
      },
      languageLabels: {
        "zh-CN": "中国語",
        "en-US": "英語",
        "ja-JP": "日本語",
        "ko-KR": "韓国語",
        "es-ES": "スペイン語",
        "fr-FR": "フランス語",
        "ru-RU": "ロシア語",
      },
    },
    "ko-KR": {
      appName: "플립 시계",
      fullscreenEnter: "전체 화면",
      fullscreenExit: "전체 화면 종료",
      statusTheme: "테마",
      statusDisplayLong: "시:분:초",
      statusDisplayShort: "시:분",
      statusHour12: "12시간제",
      statusHour24: "24시간제",
      settingsTitle: "설정",
      language: "언어",
      displayTitle: "표시",
      displayDescription: "시간 표기 방식과 카드 크기를 조정합니다.",
      clockMode: "시간 형식",
      mode12: "12시간",
      mode24: "24시간",
      seconds: "초",
      show: "표시",
      hide: "숨김",
      screensaver: "스크린세이버 모드",
      screensaverDescription: "날짜, 시분초, AM/PM만 표시합니다.",
      screensaverExitHint: "Esc 키 또는 클릭으로 종료",
      specialDisplayTitle: "전체 화면 / 스크린세이버",
      specialDisplayDescription: "이 설정은 전체 화면과 스크린세이버 화면에서만 적용됩니다.",
      showDate: "날짜 표시",
      showHourLabel: "시 라벨 표시",
      showMinuteLabel: "분 라벨 표시",
      showSecondLabel: "초 라벨 표시",
      showDayPeriod: "AM/PM 표시",
      clockSize: "시계 크기",
      fullscreen: "전체 화면",
      on: "켜기",
      off: "끄기",
      themesTitle: "테마",
      themesDescription: "시계의 표시 스타일을 전환합니다.",
      timezoneTitle: "시간대",
      timezoneDescription: "도시 프리셋을 고르거나 유효한 IANA 시간대를 직접 입력하세요.",
      presetCities: "도시 프리셋",
      customTimezone: "사용자 시간대",
      customTimezonePlaceholder: "예: Europe/Berlin",
      customTimezoneOption: "사용자 시간대",
      currentZone: "현재 시간대",
      timezoneError: "Europe/Berlin 과 같은 유효한 IANA 시간대를 입력하세요.",
      hours: "시",
      minutes: "분",
      secondsLabel: "초",
      localTime: "로컬",
      timezoneLabels: {
        local: "로컬",
        UTC: "UTC",
        "America/Los_Angeles": "로스앤젤레스",
        "America/New_York": "뉴욕",
        "Europe/London": "런던",
        "Europe/Paris": "파리",
        "Asia/Tokyo": "도쿄",
        "Asia/Shanghai": "상하이",
      },
      themeLabels: {
        dark: "나이트",
        light: "페이퍼",
        mechanical: "브라스",
        neon: "네온",
      },
      themeDescriptions: {
        dark: "어두운 글라스와 금속 플립 카드",
        light: "밝은 공간용 따뜻한 데스크 시계 톤",
        mechanical: "황동과 작업실 그림자를 담은 빈티지 스타일",
        neon: "보조 화면에 맞는 고대비 시안 글로우",
      },
      sizeLabels: {
        compact: "소형",
        comfortable: "중형",
        large: "대형",
      },
      languageLabels: {
        "zh-CN": "중국어",
        "en-US": "영어",
        "ja-JP": "일본어",
        "ko-KR": "한국어",
        "es-ES": "스페인어",
        "fr-FR": "프랑스어",
        "ru-RU": "러시아어",
      },
    },
    "es-ES": {
      appName: "Reloj Flip",
      fullscreenEnter: "Pantalla completa",
      fullscreenExit: "Salir de pantalla completa",
      statusTheme: "tema",
      statusDisplayLong: "HH:MM:SS",
      statusDisplayShort: "HH:MM",
      statusHour12: "12 horas",
      statusHour24: "24 horas",
      settingsTitle: "Ajustes",
      language: "Idioma",
      displayTitle: "Pantalla",
      displayDescription: "Elige el modo de lectura y la escala de tarjetas.",
      clockMode: "Modo de reloj",
      mode12: "12 horas",
      mode24: "24 horas",
      seconds: "Segundos",
      show: "Mostrar",
      hide: "Ocultar",
      screensaver: "Modo salvapantallas",
      screensaverDescription: "Muestra solo la fecha, hora con segundos y AM/PM.",
      screensaverExitHint: "Pulsa Esc o haz clic para salir del salvapantallas",
      specialDisplayTitle: "Pantalla completa / Salvapantallas",
      specialDisplayDescription: "Estos ajustes solo afectan a las vistas de pantalla completa y salvapantallas.",
      showDate: "Mostrar fecha",
      showHourLabel: "Mostrar etiqueta de horas",
      showMinuteLabel: "Mostrar etiqueta de minutos",
      showSecondLabel: "Mostrar etiqueta de segundos",
      showDayPeriod: "Mostrar AM/PM",
      clockSize: "Tamaño del reloj",
      fullscreen: "Pantalla completa",
      on: "Activar",
      off: "Desactivar",
      themesTitle: "Temas",
      themesDescription: "Cambia el estilo visual del reloj.",
      timezoneTitle: "Zona horaria",
      timezoneDescription: "Usa un ajuste preestablecido o introduce una zona IANA válida.",
      presetCities: "Ciudades predefinidas",
      customTimezone: "Zona horaria personalizada",
      customTimezonePlaceholder: "Ejemplo: Europe/Berlin",
      customTimezoneOption: "Zona horaria personalizada",
      currentZone: "Zona actual",
      timezoneError: "Introduce una zona IANA válida como Europe/Berlin.",
      hours: "Horas",
      minutes: "Minutos",
      secondsLabel: "Segundos",
      localTime: "Local",
      timezoneLabels: {
        local: "Local",
        UTC: "UTC",
        "America/Los_Angeles": "Los Ángeles",
        "America/New_York": "Nueva York",
        "Europe/London": "Londres",
        "Europe/Paris": "París",
        "Asia/Tokyo": "Tokio",
        "Asia/Shanghai": "Shanghái",
      },
      themeLabels: {
        dark: "Noche",
        light: "Papel",
        mechanical: "Latón",
        neon: "Neón",
      },
      themeDescriptions: {
        dark: "Cristal oscuro con tarjetas de acero",
        light: "Tonos cálidos de reloj de escritorio",
        mechanical: "Latón vintage y sombras de taller",
        neon: "Brillo cian de alto contraste para pantallas secundarias",
      },
      sizeLabels: {
        compact: "Pequeño",
        comfortable: "Mediano",
        large: "Grande",
      },
      languageLabels: {
        "zh-CN": "Chino",
        "en-US": "Inglés",
        "ja-JP": "Japonés",
        "ko-KR": "Coreano",
        "es-ES": "Español",
        "fr-FR": "Francés",
        "ru-RU": "Ruso",
      },
    },
    "fr-FR": {
      appName: "Horloge Flip",
      fullscreenEnter: "Plein écran",
      fullscreenExit: "Quitter le plein écran",
      statusTheme: "thème",
      statusDisplayLong: "HH:MM:SS",
      statusDisplayShort: "HH:MM",
      statusHour12: "Format 12h",
      statusHour24: "Format 24h",
      settingsTitle: "Paramètres",
      language: "Langue",
      displayTitle: "Affichage",
      displayDescription: "Choisissez le mode d'affichage et la taille des cartes.",
      clockMode: "Mode horloge",
      mode12: "12 heures",
      mode24: "24 heures",
      seconds: "Secondes",
      show: "Afficher",
      hide: "Masquer",
      screensaver: "Mode économiseur d'écran",
      screensaverDescription: "Affiche uniquement la date, l'heure avec secondes et AM/PM.",
      screensaverExitHint: "Appuyez sur Échap ou cliquez pour quitter l'économiseur d'écran",
      specialDisplayTitle: "Plein écran / Économiseur d'écran",
      specialDisplayDescription: "Ces réglages s'appliquent uniquement en plein écran et en mode économiseur d'écran.",
      showDate: "Afficher la date",
      showHourLabel: "Afficher l'étiquette des heures",
      showMinuteLabel: "Afficher l'étiquette des minutes",
      showSecondLabel: "Afficher l'étiquette des secondes",
      showDayPeriod: "Afficher AM/PM",
      clockSize: "Taille de l'horloge",
      fullscreen: "Plein écran",
      on: "Activer",
      off: "Désactiver",
      themesTitle: "Thèmes",
      themesDescription: "Changez le style visuel de l'horloge.",
      timezoneTitle: "Fuseau horaire",
      timezoneDescription: "Utilisez un préréglage ou saisissez un fuseau IANA valide.",
      presetCities: "Villes prédéfinies",
      customTimezone: "Fuseau horaire personnalisé",
      customTimezonePlaceholder: "Exemple : Europe/Berlin",
      customTimezoneOption: "Fuseau horaire personnalisé",
      currentZone: "Fuseau actuel",
      timezoneError: "Saisissez un fuseau IANA valide comme Europe/Berlin.",
      hours: "Heures",
      minutes: "Minutes",
      secondsLabel: "Secondes",
      localTime: "Local",
      timezoneLabels: {
        local: "Local",
        UTC: "UTC",
        "America/Los_Angeles": "Los Angeles",
        "America/New_York": "New York",
        "Europe/London": "Londres",
        "Europe/Paris": "Paris",
        "Asia/Tokyo": "Tokyo",
        "Asia/Shanghai": "Shanghai",
      },
      themeLabels: {
        dark: "Nuit",
        light: "Papier",
        mechanical: "Laiton",
        neon: "Néon",
      },
      themeDescriptions: {
        dark: "Verre sombre avec cartes en acier",
        light: "Tons chauds d'horloge de bureau pour pièces lumineuses",
        mechanical: "Laiton vintage et ombres d'atelier",
        neon: "Lueur cyan à fort contraste pour écrans secondaires",
      },
      sizeLabels: {
        compact: "Petit",
        comfortable: "Moyen",
        large: "Grand",
      },
      languageLabels: {
        "zh-CN": "Chinois",
        "en-US": "Anglais",
        "ja-JP": "Japonais",
        "ko-KR": "Coréen",
        "es-ES": "Espagnol",
        "fr-FR": "Français",
        "ru-RU": "Russe",
      },
    },
    "ru-RU": {
      appName: "Флип-часы",
      fullscreenEnter: "На весь экран",
      fullscreenExit: "Выйти из полного экрана",
      statusTheme: "тема",
      statusDisplayLong: "ЧЧ:ММ:СС",
      statusDisplayShort: "ЧЧ:ММ",
      statusHour12: "12-часовой",
      statusHour24: "24-часовой",
      settingsTitle: "Настройки",
      language: "Язык",
      displayTitle: "Дисплей",
      displayDescription: "Выберите режим отображения и масштаб карточек.",
      clockMode: "Формат времени",
      mode12: "12 часов",
      mode24: "24 часа",
      seconds: "Секунды",
      show: "Показать",
      hide: "Скрыть",
      screensaver: "Режим заставки",
      screensaverDescription: "Показывать только дату, время с секундами и AM/PM.",
      screensaverExitHint: "Нажмите Esc или щёлкните мышью для выхода из заставки",
      specialDisplayTitle: "Полный экран / Заставка",
      specialDisplayDescription: "Эти настройки применяются только в режиме полного экрана и заставки.",
      showDate: "Показывать дату",
      showHourLabel: "Показывать метку часов",
      showMinuteLabel: "Показывать метку минут",
      showSecondLabel: "Показывать метку секунд",
      showDayPeriod: "Показывать AM/PM",
      clockSize: "Размер часов",
      fullscreen: "Полный экран",
      on: "Вкл",
      off: "Выкл",
      themesTitle: "Темы",
      themesDescription: "Переключайте визуальный стиль часов.",
      timezoneTitle: "Часовой пояс",
      timezoneDescription: "Используйте предустановку или введите корректный пояс IANA.",
      presetCities: "Города",
      customTimezone: "Свой часовой пояс",
      customTimezonePlaceholder: "Например: Europe/Berlin",
      customTimezoneOption: "Свой часовой пояс",
      currentZone: "Текущий пояс",
      timezoneError: "Введите корректный часовой пояс IANA, например Europe/Berlin.",
      hours: "Часы",
      minutes: "Минуты",
      secondsLabel: "Секунды",
      localTime: "Местное",
      timezoneLabels: {
        local: "Местное",
        UTC: "UTC",
        "America/Los_Angeles": "Лос-Анджелес",
        "America/New_York": "Нью-Йорк",
        "Europe/London": "Лондон",
        "Europe/Paris": "Париж",
        "Asia/Tokyo": "Токио",
        "Asia/Shanghai": "Шанхай",
      },
      themeLabels: {
        dark: "Ночь",
        light: "Бумага",
        mechanical: "Латунь",
        neon: "Неон",
      },
      themeDescriptions: {
        dark: "Тёмное стекло со стальными карточками",
        light: "Тёплые тона настольных часов для светлых комнат",
        mechanical: "Винтажная латунь и тени мастерской",
        neon: "Высококонтрастное голубое свечение для дополнительных экранов",
      },
      sizeLabels: {
        compact: "Маленький",
        comfortable: "Средний",
        large: "Большой",
      },
      languageLabels: {
        "zh-CN": "Китайский",
        "en-US": "Английский",
        "ja-JP": "Японский",
        "ko-KR": "Корейский",
        "es-ES": "Испанский",
        "fr-FR": "Французский",
        "ru-RU": "Русский",
      },
    },
  };

  const defaultSettings: ClockSettings = {
    hour12: false,
    showSeconds: true,
    screensaver: false,
    showDateInSpecialMode: true,
    showHourLabelInSpecialMode: true,
    showMinuteLabelInSpecialMode: true,
    showSecondLabelInSpecialMode: true,
    showDayPeriodInSpecialMode: true,
    theme: "dark",
    size: "comfortable",
    timeZone: "local",
    language: "zh-CN",
  };

  const timeZonePresets = [
    { value: "local" },
    { value: "UTC" },
    { value: "America/Los_Angeles" },
    { value: "America/New_York" },
    { value: "Europe/London" },
    { value: "Europe/Paris" },
    { value: "Asia/Tokyo" },
    { value: "Asia/Shanghai" },
  ] as const;

  const themeValues: Theme[] = ["dark", "light", "mechanical", "neon"];
  const sizeOptions: ClockSize[] = ["compact", "comfortable", "large"];

  let now = new Date();
  let settings: ClockSettings = defaultSettings;
  let mounted = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let fullscreen = false;
  let pseudoFullscreen = false;
  let clockShell: HTMLDivElement;
  let customTimeZoneInput = "local";
  let timeZoneError = "";
  let supportedTimeZones: string[] = [];

  function isValidTimeZone(value: string) {
    if (value === "local") return true;

    try {
      new Intl.DateTimeFormat("en-US", { timeZone: value }).format(now);
      return true;
    } catch {
      return false;
    }
  }

  function getSelectedTimeZone(clockSettings: ClockSettings) {
    return clockSettings.timeZone === "local" ? undefined : clockSettings.timeZone;
  }

  function formatTimeZoneLabel(value: string, copy: Copy) {
    if (value === "local") return copy.localTime;

    const localized = copy.timezoneLabels[value];
    if (localized) return localized;

    return value.replaceAll("_", " ");
  }

  function loadSettings() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultSettings;

    try {
      const parsed = { ...defaultSettings, ...JSON.parse(stored) } as ClockSettings;
      const normalized = { ...parsed, showSeconds: true };
      return isValidTimeZone(normalized.timeZone) ? normalized : defaultSettings;
    } catch {
      return defaultSettings;
    }
  }

  function tick() {
    now = new Date();
    const delay = 1000 - now.getMilliseconds() + 20;
    timer = setTimeout(tick, delay);
  }

  function updateSetting<K extends keyof ClockSettings>(key: K, value: ClockSettings[K]) {
    settings = { ...settings, [key]: value };
  }

  function exitScreensaver() {
    if (!settings.screensaver) return;
    updateSetting("screensaver", false);
  }

  function handleScreensaverKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      exitScreensaver();
    }
  }

  function applyTimeZone(value: string, copy: Copy) {
    const normalized = value.trim() || "local";

    if (!isValidTimeZone(normalized)) {
      timeZoneError = copy.timezoneError;
      return;
    }

    timeZoneError = "";
    customTimeZoneInput = normalized;
    updateSetting("timeZone", normalized);
  }

  async function toggleFullscreen() {
    if (!clockShell) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    if (pseudoFullscreen) {
      pseudoFullscreen = false;
      return;
    }

    const canUseNativeFullscreen =
      typeof clockShell.requestFullscreen === "function" && document.fullscreenEnabled;

    if (!canUseNativeFullscreen) {
      pseudoFullscreen = true;
      return;
    }

    try {
      await clockShell.requestFullscreen();
    } catch {
      pseudoFullscreen = true;
    }
  }

  function handleFullscreenChange() {
    fullscreen = !!document.fullscreenElement;
    if (fullscreen) {
      pseudoFullscreen = false;
    }
  }

  function getTimeParts(date: Date, clockSettings: ClockSettings) {
    const formatter = new Intl.DateTimeFormat(clockSettings.language, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: clockSettings.hour12,
      timeZone: getSelectedTimeZone(clockSettings),
    });

    const parts = formatter.formatToParts(date);
    const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));

    return {
      hour: lookup.hour ?? "00",
      minute: lookup.minute ?? "00",
      second: lookup.second ?? "00",
      dayPeriod: clockSettings.hour12 ? lookup.dayPeriod ?? "" : "",
    };
  }

  function getDateLine(date: Date, clockSettings: ClockSettings) {
    const formatter = new Intl.DateTimeFormat(clockSettings.language, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: getSelectedTimeZone(clockSettings),
    });

    return formatter.format(date);
  }

  $: copy = translations[settings.language];
  $: effectiveShowSeconds = true;
  $: activeFullscreen = fullscreen || pseudoFullscreen;
  $: specialDisplayMode = activeFullscreen || settings.screensaver;
  $: timeParts = getTimeParts(now, settings);
  $: dateLine = getDateLine(now, settings);
  $: segments = [
    {
      key: "hour",
      value: timeParts.hour,
      label: copy.hours,
      showLabel: !specialDisplayMode || settings.showHourLabelInSpecialMode,
    },
    {
      key: "minute",
      value: timeParts.minute,
      label: copy.minutes,
      showLabel: !specialDisplayMode || settings.showMinuteLabelInSpecialMode,
    },
    ...(effectiveShowSeconds
      ? [{
          key: "second",
          value: timeParts.second,
          label: copy.secondsLabel,
          showLabel: !specialDisplayMode || settings.showSecondLabelInSpecialMode,
        }]
      : []),
  ] as Array<TimeSegment & { showLabel: boolean }>;
  $: timeZoneLabel = formatTimeZoneLabel(settings.timeZone, copy);
  $: themeLabel = copy.themeLabels[settings.theme];

  $: if (mounted) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    document.documentElement.dataset.theme = settings.theme;
    document.documentElement.lang = settings.language;
    document.body.style.overflow = activeFullscreen ? "hidden" : "";
  }

  onMount(() => {
    settings = loadSettings();
    customTimeZoneInput = settings.timeZone;
    supportedTimeZones = typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("timeZone")
      : timeZonePresets.map((option) => option.value).filter((value) => value !== "local");
    mounted = true;
    document.documentElement.dataset.theme = settings.theme;
    document.documentElement.lang = settings.language;
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("keydown", handleScreensaverKeydown);
    handleFullscreenChange();
    tick();
  });

  onDestroy(() => {
    if (timer) clearTimeout(timer);
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
    document.removeEventListener("keydown", handleScreensaverKeydown);
    document.body.style.overflow = "";
  });
</script>

<svelte:head>
  <title>{copy.appName}</title>
</svelte:head>

<div
  class="app-shell"
  data-size={settings.size}
  bind:this={clockShell}
  data-fullscreen={activeFullscreen}
  data-screensaver={settings.screensaver}
>
  <section class="clock-panel">
    {#if settings.screensaver}
      <button
        type="button"
        class="screensaver-exit"
        aria-label={copy.screensaverExitHint}
        on:click={exitScreensaver}
      ></button>
    {/if}

    <div class="clock-meta">
      <div class="meta-head">
        <div>
          {#if !settings.screensaver}
            <p class="eyebrow">{copy.appName}</p>
          {/if}
          {#if !specialDisplayMode || settings.showDateInSpecialMode}
            <div class="date-row">
              <h1>{dateLine}</h1>
              {#if !settings.screensaver}
                <span>{timeZoneLabel}</span>
              {/if}
            </div>
          {/if}
        </div>

        {#if !settings.screensaver}
          <button
            type="button"
            class="fullscreen-toggle"
            aria-pressed={activeFullscreen}
            on:click={toggleFullscreen}
          >
            {activeFullscreen ? copy.fullscreenExit : copy.fullscreenEnter}
          </button>
        {/if}
      </div>

      {#if !settings.screensaver}
        <div class="status-row" aria-live="polite">
          <span>{themeLabel} {copy.statusTheme}</span>
          <span>{copy.statusDisplayLong}</span>
          <span>{settings.hour12 ? copy.statusHour12 : copy.statusHour24}</span>
        </div>
      {/if}
    </div>

    <div class="clock" class:compact={!effectiveShowSeconds}>
      {#each segments as segment (segment.key)}
        <div class="segment" data-segment={segment.key}>
          <FlipUnit value={segment.value} />
          {#if segment.showLabel}
            <span>{segment.label}</span>
          {/if}
        </div>
      {/each}

      {#if settings.hour12 && timeParts.dayPeriod && (!specialDisplayMode || settings.showDayPeriodInSpecialMode)}
        <div class="period-pill">{timeParts.dayPeriod}</div>
      {/if}
    </div>

  </section>

  <aside class="settings-panel" aria-label={copy.appName}>
    <div class="settings-header">
      <h2>{copy.settingsTitle}</h2>
    </div>

    <section class="settings-group" aria-labelledby="language-settings">
      <div class="group-heading">
        <h2 id="language-settings">{copy.language}</h2>
      </div>

      <label class="setting stacked" for="language">
        <select
          id="language"
          value={settings.language}
          on:change={(event) =>
            updateSetting("language", (event.currentTarget as HTMLSelectElement).value as Language)}
        >
          {#each languageOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </label>
    </section>

    <section class="settings-group" aria-labelledby="display-settings">
      <div class="group-heading">
        <h2 id="display-settings">{copy.displayTitle}</h2>
        <p>{copy.displayDescription}</p>
      </div>

      <div class="setting">
        <span>{copy.clockMode}</span>
        <button
          type="button"
          class:active={!settings.hour12}
          aria-pressed={!settings.hour12}
          on:click={() => updateSetting("hour12", false)}
        >
          {copy.mode24}
        </button>
        <button
          type="button"
          class:active={settings.hour12}
          aria-pressed={settings.hour12}
          on:click={() => updateSetting("hour12", true)}
        >
          {copy.mode12}
        </button>
      </div>

      <div class="setting stacked">
        <span>{copy.screensaver}</span>
        <button
          type="button"
          class:active={settings.screensaver}
          aria-pressed={settings.screensaver}
          on:click={() => updateSetting("screensaver", !settings.screensaver)}
        >
          {settings.screensaver ? copy.on : copy.off}
        </button>
        <small>{copy.screensaverDescription}</small>
      </div>

      <div class="setting-options">
        <div class="group-heading">
          <h2>{copy.specialDisplayTitle}</h2>
          <p>{copy.specialDisplayDescription}</p>
        </div>

        <div class="setting toggle-row">
          <span>{copy.showDate}</span>
          <button
            type="button"
            class:active={settings.showDateInSpecialMode}
            aria-pressed={settings.showDateInSpecialMode}
            on:click={() => updateSetting("showDateInSpecialMode", !settings.showDateInSpecialMode)}
          >
            {settings.showDateInSpecialMode ? copy.on : copy.off}
          </button>
        </div>

        <div class="setting toggle-row">
          <span>{copy.showHourLabel}</span>
          <button
            type="button"
            class:active={settings.showHourLabelInSpecialMode}
            aria-pressed={settings.showHourLabelInSpecialMode}
            on:click={() => updateSetting("showHourLabelInSpecialMode", !settings.showHourLabelInSpecialMode)}
          >
            {settings.showHourLabelInSpecialMode ? copy.on : copy.off}
          </button>
        </div>

        <div class="setting toggle-row">
          <span>{copy.showMinuteLabel}</span>
          <button
            type="button"
            class:active={settings.showMinuteLabelInSpecialMode}
            aria-pressed={settings.showMinuteLabelInSpecialMode}
            on:click={() => updateSetting("showMinuteLabelInSpecialMode", !settings.showMinuteLabelInSpecialMode)}
          >
            {settings.showMinuteLabelInSpecialMode ? copy.on : copy.off}
          </button>
        </div>

        <div class="setting toggle-row">
          <span>{copy.showSecondLabel}</span>
          <button
            type="button"
            class:active={settings.showSecondLabelInSpecialMode}
            aria-pressed={settings.showSecondLabelInSpecialMode}
            on:click={() => updateSetting("showSecondLabelInSpecialMode", !settings.showSecondLabelInSpecialMode)}
          >
            {settings.showSecondLabelInSpecialMode ? copy.on : copy.off}
          </button>
        </div>

        <div class="setting toggle-row">
          <span>{copy.showDayPeriod}</span>
          <button
            type="button"
            class:active={settings.showDayPeriodInSpecialMode}
            aria-pressed={settings.showDayPeriodInSpecialMode}
            on:click={() => updateSetting("showDayPeriodInSpecialMode", !settings.showDayPeriodInSpecialMode)}
          >
            {settings.showDayPeriodInSpecialMode ? copy.on : copy.off}
          </button>
        </div>
      </div>

      <label class="setting stacked" for="size">
        <span>{copy.clockSize}</span>
        <select
          id="size"
          value={settings.size}
          on:change={(event) =>
            updateSetting("size", (event.currentTarget as HTMLSelectElement).value as ClockSize)}
        >
          {#each sizeOptions as option}
            <option value={option}>{copy.sizeLabels[option]}</option>
          {/each}
        </select>
      </label>

      <div class="setting stacked">
        <span>{copy.fullscreen}</span>
        <button
          type="button"
          class:active={activeFullscreen}
          aria-pressed={activeFullscreen}
          on:click={toggleFullscreen}
        >
          {activeFullscreen ? copy.on : copy.off}
        </button>
      </div>
    </section>

    <section class="settings-group" aria-labelledby="theme-settings">
      <div class="group-heading">
        <h2 id="theme-settings">{copy.themesTitle}</h2>
        <p>{copy.themesDescription}</p>
      </div>

      <div class="theme-grid">
        {#each themeValues as theme}
          <button
            type="button"
            class="theme-card"
            class:active={settings.theme === theme}
            aria-pressed={settings.theme === theme}
            on:click={() => updateSetting("theme", theme)}
          >
            <strong>{copy.themeLabels[theme]}</strong>
            <span>{copy.themeDescriptions[theme]}</span>
          </button>
        {/each}
      </div>
    </section>

    <section class="settings-group" aria-labelledby="timezone-settings">
      <div class="group-heading">
        <h2 id="timezone-settings">{copy.timezoneTitle}</h2>
        <p>{copy.timezoneDescription}</p>
      </div>

      <label class="setting stacked" for="timezone-preset">
        <span>{copy.presetCities}</span>
        <select
          id="timezone-preset"
          value={timeZonePresets.some((option) => option.value === settings.timeZone) ? settings.timeZone : "custom"}
          on:change={(event) => {
            const value = (event.currentTarget as HTMLSelectElement).value;
            if (value !== "custom") applyTimeZone(value, copy);
          }}
        >
          {#each timeZonePresets as option}
            <option value={option.value}>{copy.timezoneLabels[option.value] ?? option.value}</option>
          {/each}
          <option value="custom">{copy.customTimezoneOption}</option>
        </select>
      </label>

      <label class="setting stacked" for="timezone-custom">
        <span>{copy.customTimezone}</span>
        <input
          id="timezone-custom"
          class="timezone-input"
          list="timezone-options"
          bind:value={customTimeZoneInput}
          placeholder={copy.customTimezonePlaceholder}
          spellcheck="false"
          autocapitalize="off"
          autocomplete="off"
          on:change={() => applyTimeZone(customTimeZoneInput, copy)}
          on:blur={() => applyTimeZone(customTimeZoneInput, copy)}
        />
      </label>

      <datalist id="timezone-options">
        {#each supportedTimeZones as zone}
          <option value={zone}></option>
        {/each}
      </datalist>

      <p class:invalid={!!timeZoneError} class="timezone-note">
        {timeZoneError || `${copy.currentZone}: ${settings.timeZone}`}
      </p>
    </section>
  </aside>
</div>

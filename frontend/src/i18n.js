export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ml', label: 'മലയാളം' },
]

export const translations = {
  en: {
    navToday: 'Today',
    navCalendar: 'Calendar',
    navStats: 'Stats',
    navProfile: 'Profile',
    calendarTitle: 'Calendar',
    calendarSubtitle: 'Monthly salah consistency',
    tracked: 'Tracked',
    completed: 'Completed',
    onTime: 'On Time',
    qada: 'Qada',
    missed: 'Missed',
    pending: 'Pending',
    noData: 'No Data',
    noPrayerData: 'No prayer data recorded',
    language: 'Language',
    profile: 'Profile',
    editProfile: 'Edit Profile',
    displayName: 'Display Name',
    city: 'City',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    prayerReminders: 'Prayer Reminders',
    notificationsEnabled: 'Notifications enabled',
    enableNotifications: 'Tap to enable notifications',
    ayatulKursiBonus: 'Bonus: Recite Ayatul Kursi after salah',
    logOut: 'Log Out',
  },
  ml: {
    navToday: 'ഇന്ന്',
    navCalendar: 'കലണ്ടർ',
    navStats: 'സ്ഥിതിവിവരം',
    navProfile: 'പ്രൊഫൈൽ',
    calendarTitle: 'കലണ്ടർ',
    calendarSubtitle: 'മാസത്തിലെ നമസ്കാര സ്ഥിരത',
    tracked: 'രേഖപ്പെടുത്തി',
    completed: 'പൂർത്തിയായി',
    onTime: 'സമയത്ത്',
    qada: 'ഖദാ',
    missed: 'മിസ്സായി',
    pending: 'ബാക്കി',
    noData: 'ഡാറ്റ ഇല്ല',
    noPrayerData: 'ഈ ദിവസത്തെ നമസ്കാര വിവരം ഇല്ല',
    language: 'ഭാഷ',
    profile: 'പ്രൊഫൈൽ',
    editProfile: 'പ്രൊഫൈൽ തിരുത്തുക',
    displayName: 'പേര്',
    city: 'നഗരം',
    saveChanges: 'സേവ് ചെയ്യുക',
    saving: 'സേവ് ചെയ്യുന്നു...',
    prayerReminders: 'നമസ്കാര ഓർമ്മപ്പെടുത്തൽ',
    notificationsEnabled: 'നോട്ടിഫിക്കേഷൻ ഓണാണ്',
    enableNotifications: 'നോട്ടിഫിക്കേഷൻ ഓൺ ചെയ്യാൻ ടാപ്പ് ചെയ്യുക',
    ayatulKursiBonus: 'ബോണസ്: നമസ്കാരത്തിനു ശേഷം ആയത്തുൽ കുർസി ഓതുക',
    logOut: 'ലോഗ് ഔട്ട്',
  },
}

export function getTranslator(language) {
  const dictionary = translations[language] || translations.en
  return (key) => dictionary[key] || translations.en[key] || key
}

export function getLocale(language) {
  return language === 'ml' ? 'ml-IN' : 'en-US'
}

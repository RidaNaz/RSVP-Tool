export const LANGS = [{ code: 'en', label: 'English' }, { code: 'es', label: 'Español' }, { code: 'pt', label: 'Português' }, { code: 'ar', label: 'العربية' }] as const
export type Lang = (typeof LANGS)[number]['code']
export const isLang = (s: string): s is Lang => LANGS.some((l) => l.code === s)

// [en, es, pt, ar] labels. Adding an occasion = adding a row.
export const OCC: string[][] = [
  ['Wedding', 'Boda', 'Casamento', 'حفل زفاف'], ['Engagement', 'Compromiso', 'Noivado', 'خطوبة'],
  ['Kids birthday', 'Cumpleaños infantil', 'Aniversário infantil', 'عيد ميلاد طفل'], ['Birthday', 'Cumpleaños', 'Aniversário', 'عيد ميلاد'],
  ['Baby shower', 'Baby shower', 'Chá de bebê', 'حفل استقبال مولود'], ['Bridal shower', 'Despedida de soltera', 'Chá de panela', 'حفل العروس'],
  ['Graduation', 'Graduación', 'Formatura', 'حفل تخرج'], ['Eid / Iftar', 'Eid / Iftar', 'Eid / Iftar', 'عيد / إفطار'],
  ['Diwali', 'Diwali', 'Diwali', 'ديوالي'], ['Housewarming', 'Inauguración', 'Chá de casa nova', 'انتقال منزل'],
  ['Anniversary', 'Aniversario', 'Aniversário de casamento', 'ذكرى سنوية'], ['Party', 'Fiesta', 'Festa', 'حفلة'],
]
export const LI: Record<Lang, number> = { en: 0, es: 1, pt: 2, ar: 3 }

const en = { brand: 'RSVP Invitation Maker', hero: 'Design an invitation. Share one link.', sub: 'Guests answer on WhatsApp and add the date to their calendar in one tap. Full links store nothing on a server.',
  occ: 'Occasion', title: 'Title', host: 'Hosted by', when: 'Date and time', tz: 'Time zone', dur: 'Duration (minutes)', venue: 'Venue', map: 'Map link (optional)', note: 'Message',
  wa: 'Your WhatsApp number (with country code)', em: 'Or your email', pal: 'Color theme', lay: 'Layout', stk: 'Ornament', cls: 'Classic', bld: 'Modern', inv: "You're invited", by: 'Hosted by',
  share: 'Copy invitation link', wsh: 'Share on WhatsApp', copied: 'Link copied', priv: 'Your WhatsApp number and event details are part of the link. Anyone with the link can read them.',
  yes: 'Yes', no: 'No', maybe: 'Maybe', name: 'Your name', gs: 'Number of guests', send: 'Send reply', cal: 'Add to calendar', gcal: 'Google Calendar', ics: 'Apple / Outlook (.ics)',
  icsHint: 'If the download is blocked, open this page in your browser.', mk: 'Make your own invitation', rsvpQ: 'Will you come?', bad: 'This invitation link is broken or incomplete.',
  local: 'Your local time', noRsvp: 'The host has not added a reply contact.', len: 'Link length', long: 'Long link: shorten the message so chat apps do not cut it.', open: 'Open invitation', tap: 'A message is waiting for you' }
export type Locale = typeof en
export const T: Record<Lang, Locale> = {
  en,
  es: { ...en, brand: 'Creador de invitaciones con RSVP', hero: 'Diseña una invitación. Comparte un enlace.', sub: 'Tus invitados responden por WhatsApp y guardan la fecha en su calendario con un toque. Los enlaces completos no guardan nada en un servidor.',
    occ: 'Ocasión', title: 'Título', host: 'Anfitrión', when: 'Fecha y hora', tz: 'Zona horaria', dur: 'Duración (minutos)', venue: 'Lugar', map: 'Enlace de mapa (opcional)', note: 'Mensaje',
    wa: 'Tu WhatsApp (con código de país)', em: 'O tu correo', pal: 'Tema de color', lay: 'Diseño', stk: 'Adorno', cls: 'Clásico', bld: 'Moderno', inv: 'Estás invitado', by: 'Organiza',
    share: 'Copiar enlace', wsh: 'Compartir por WhatsApp', copied: 'Enlace copiado', priv: 'Tu WhatsApp y los datos del evento forman parte del enlace. Cualquiera con el enlace puede leerlos.',
    yes: 'Sí', no: 'No', maybe: 'Quizás', name: 'Tu nombre', gs: 'Número de invitados', send: 'Enviar respuesta', cal: 'Añadir al calendario', icsHint: 'Si se bloquea la descarga, abre esta página en tu navegador.',
    mk: 'Crea tu propia invitación', rsvpQ: '¿Vendrás?', bad: 'El enlace de la invitación está roto o incompleto.', local: 'Tu hora local', noRsvp: 'El anfitrión no añadió un contacto para responder.',
    len: 'Longitud del enlace', long: 'Enlace largo: acorta el mensaje.', open: 'Abrir invitación', tap: 'Tienes un mensaje' },
  pt: { ...en, brand: 'Criador de convites com RSVP', hero: 'Crie um convite. Compartilhe um link.', sub: 'Os convidados respondem pelo WhatsApp e salvam a data na agenda com um toque. Links completos não guardam nada em um servidor.',
    occ: 'Ocasião', title: 'Título', host: 'Anfitrião', when: 'Data e hora', tz: 'Fuso horário', dur: 'Duração (minutos)', venue: 'Local', map: 'Link do mapa (opcional)', note: 'Mensagem',
    wa: 'Seu WhatsApp (com código do país)', em: 'Ou seu e-mail', pal: 'Tema de cor', lay: 'Layout', stk: 'Ornamento', cls: 'Clássico', bld: 'Moderno', inv: 'Você está convidado', by: 'Oferecido por',
    share: 'Copiar link', wsh: 'Compartilhar no WhatsApp', copied: 'Link copiado', priv: 'Seu WhatsApp e os dados do evento fazem parte do link. Quem tiver o link pode ler.',
    yes: 'Sim', no: 'Não', maybe: 'Talvez', name: 'Seu nome', gs: 'Número de convidados', send: 'Enviar resposta', cal: 'Adicionar à agenda', gcal: 'Google Agenda', icsHint: 'Se o download for bloqueado, abra esta página no navegador.',
    mk: 'Crie seu próprio convite', rsvpQ: 'Você vem?', bad: 'O link do convite está quebrado ou incompleto.', local: 'Seu horário local', noRsvp: 'O anfitrião não informou um contato.',
    len: 'Tamanho do link', long: 'Link longo: encurte a mensagem.', open: 'Abrir convite', tap: 'Há uma mensagem para você' },
  ar: { ...en, brand: 'صانع دعوات مع تأكيد الحضور', hero: 'صمّم دعوتك. شارك رابطًا واحدًا.', sub: 'يرد الضيوف عبر واتساب ويضيفون الموعد إلى تقويمهم بلمسة واحدة. الروابط الكاملة لا تحفظ شيئًا على خادم.',
    occ: 'المناسبة', title: 'العنوان', host: 'المضيف', when: 'التاريخ والوقت', tz: 'المنطقة الزمنية', dur: 'المدة (دقائق)', venue: 'المكان', map: 'رابط الخريطة (اختياري)', note: 'رسالة',
    wa: 'رقم واتساب (مع رمز الدولة)', em: 'أو بريدك الإلكتروني', pal: 'نسق الألوان', lay: 'التصميم', stk: 'زخرفة', cls: 'كلاسيكي', bld: 'عصري', inv: 'أنت مدعو', by: 'بدعوة من',
    share: 'نسخ الرابط', wsh: 'مشاركة عبر واتساب', copied: 'تم نسخ الرابط', priv: 'رقم واتساب وتفاصيل الحدث جزء من الرابط. أي شخص لديه الرابط يمكنه قراءتها.',
    yes: 'نعم', no: 'لا', maybe: 'ربما', name: 'اسمك', gs: 'عدد الضيوف', send: 'إرسال الرد', cal: 'أضف إلى التقويم', gcal: 'تقويم Google', icsHint: 'إذا حُظر التنزيل، افتح الصفحة في المتصفح.',
    mk: 'أنشئ دعوتك', rsvpQ: 'هل ستحضر؟', bad: 'رابط الدعوة تالف أو ناقص.', local: 'توقيتك المحلي', noRsvp: 'لم يضف المضيف وسيلة للرد.',
    len: 'طول الرابط', long: 'الرابط طويل: اختصر الرسالة.', open: 'افتح الدعوة', tap: 'رسالة بانتظارك' },
}
export const PAL = [ // [name, from, to, ink, gold]
  ['Rose gold', '#fbe3ea', '#f3b6c8', '#6b1b3d', '#a16207'], ['Emerald', '#0f5c50', '#07332d', '#f6efdc', '#e5c26b'],
  ['Midnight', '#1e2a52', '#0c1230', '#eef1ff', '#e5c26b'], ['Ivory', '#fffaf0', '#f0e4c8', '#4a3410', '#a16207'],
  ['Plum', '#5b2a86', '#2b1247', '#f6ecff', '#f0c987'], ['Sunset', '#ffe3cf', '#f7a86f', '#6b2410', '#8a3b10'],
] as const
export const ORN = ['heart', 'star', 'moon', 'sparkle', 'flower', 'diamond']

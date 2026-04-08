export const CATEGORIES = [
  {
    id: 'structure',
    name: 'Structure',
    colorClass: 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/25 dark:text-violet-300 dark:border-violet-700',
    headerBg: 'bg-violet-50 dark:bg-violet-900/10',
    accentBorder: 'border-t-2 border-t-violet-400 dark:border-t-violet-600',
    checks: [
      { id: 'h1',         name: 'Single H1',    description: 'One H1 per page, no more' },
      { id: 'headings',   name: 'Heading order', description: 'Logical H2–H6 order, no skipped levels' },
      { id: 'skip_link',  name: 'Skip nav link', description: 'Bypass block so keyboard users can jump to main content' },
      { id: 'landmarks',  name: 'Landmarks',     description: '<main>, <nav>, <footer> regions properly tagged' },
      { id: 'page_title', name: 'Page title',    description: 'Unique, descriptive <title> tag' },
      { id: 'language',   name: 'Lang attr',     description: 'lang attribute set on <html> element' },
    ],
  },
  {
    id: 'interactive',
    name: 'Interactive',
    colorClass: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/25 dark:text-blue-300 dark:border-blue-700',
    headerBg: 'bg-blue-50 dark:bg-blue-900/10',
    accentBorder: 'border-t-2 border-t-blue-400 dark:border-t-blue-600',
    checks: [
      { id: 'keyboard_accessible', name: 'Keyboard access', description: 'All interactions reachable by keyboard alone' },
      { id: 'focus_order',         name: 'Tab order',       description: 'Focus moves in a logical, predictable sequence' },
      { id: 'focus_visible',       name: 'Focus ring',      description: 'Visible focus indicator at all times' },
      { id: 'no_keyboard_trap',    name: 'No focus trap',   description: 'User can always tab out of any component' },
      { id: 'button_roles',        name: 'Button role',     description: 'No div/span/a used as button without role="button"' },
      { id: 'buttons_labels',      name: 'Button label',    description: 'Every button has visible or accessible text' },
      { id: 'link_labels',         name: 'Link text',       description: 'Descriptive link text — no "click here" or "read more"' },
      { id: 'new_tab_links',       name: 'New-tab notice',  description: 'Screen reader told when a link opens a new window' },
    ],
  },
  {
    id: 'images_media',
    name: 'Images & Media',
    colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/25 dark:text-emerald-300 dark:border-emerald-700',
    headerBg: 'bg-emerald-50 dark:bg-emerald-900/10',
    accentBorder: 'border-t-2 border-t-emerald-400 dark:border-t-emerald-600',
    checks: [
      { id: 'alt_text',          name: 'Alt text',        description: 'Meaningful images have descriptive alt attributes' },
      { id: 'decorative_images', name: 'Decorative alt',  description: 'Decorative images use role="presentation" or empty alt=""' },
      { id: 'svg_icons',         name: 'SVG/icon roles',  description: 'Inline SVGs and icon fonts have appropriate ARIA roles' },
      { id: 'functional_images', name: 'Image btn alt',   description: 'Image buttons and linked images have descriptive alt text' },
      { id: 'embedded_media',    name: 'Captions',        description: 'Videos have captions; audio has transcripts' },
    ],
  },
  {
    id: 'forms',
    name: 'Forms',
    colorClass: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/25 dark:text-orange-300 dark:border-orange-700',
    headerBg: 'bg-orange-50 dark:bg-orange-900/10',
    accentBorder: 'border-t-2 border-t-orange-400 dark:border-t-orange-600',
    checks: [
      { id: 'input_labels',       name: 'Field labels',    description: 'Every input has an associated <label>' },
      { id: 'submit_button',      name: 'Submit action',   description: 'Every form has a submission button or action' },
      { id: 'checkbox_labels',    name: 'Checkbox label',  description: 'Every checkbox is associated with a label' },
      { id: 'validation_errors',  name: 'Error SR alert',  description: 'Validation errors are announced to screen readers' },
      { id: 'error_identification', name: 'Error detail',  description: 'Error messages describe exactly what went wrong' },
    ],
  },
  {
    id: 'components',
    name: 'Components',
    colorClass: 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/25 dark:text-pink-300 dark:border-pink-700',
    headerBg: 'bg-pink-50 dark:bg-pink-900/10',
    accentBorder: 'border-t-2 border-t-pink-400 dark:border-t-pink-600',
    checks: [
      { id: 'carousels',  name: 'Carousels',   description: 'Prev/next labelled, not a live region, pagination labelled' },
      { id: 'dropdowns',  name: 'Dropdowns',   description: 'aria-expanded state reflected in the DOM' },
      { id: 'modals',     name: 'Modals',      description: 'Dialogs tagged for AT; focus trapped while open' },
      { id: 'accordions', name: 'Accordions',  description: 'aria-expanded set; correct heading structure inside' },
      { id: 'tabs',       name: 'Tabs',        description: 'role="tablist / tab" and aria-selected applied correctly' },
      { id: 'dragging',   name: 'Drag alt',    description: 'All drag interactions also work with a single pointer action' },
    ],
  },
  {
    id: 'colour_text',
    name: 'Colour & Text',
    colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/25 dark:text-yellow-300 dark:border-yellow-700',
    headerBg: 'bg-yellow-50 dark:bg-yellow-900/10',
    accentBorder: 'border-t-2 border-t-yellow-400 dark:border-t-yellow-600',
    checks: [
      { id: 'contrast',     name: 'Contrast',       description: 'Text 4.5:1 AA; large text 3:1' },
      { id: 'text_resize',  name: 'Text resize',    description: 'Readable at 200% zoom without horizontal scroll' },
      { id: 'colour_alone', name: 'Colour not only', description: 'Colour is never the sole way information is conveyed' },
      { id: 'motion',       name: 'Reduced motion',  description: 'Animations respect prefers-reduced-motion' },
    ],
  },
  {
    id: 'dynamic',
    name: 'Dynamic',
    colorClass: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/25 dark:text-cyan-300 dark:border-cyan-700',
    headerBg: 'bg-cyan-50 dark:bg-cyan-900/10',
    accentBorder: 'border-t-2 border-t-cyan-400 dark:border-t-cyan-600',
    checks: [
      { id: 'hidden_tabindex', name: 'Hidden focusable', description: 'Hidden elements are excluded from tab order' },
      { id: 'live_regions',   name: 'Live regions',     description: 'Dynamic updates announced correctly; not overused' },
      { id: 'loading_states', name: 'Loading notice',   description: 'Async content changes are announced to AT' },
      { id: 'page_reflow',    name: '320px reflow',     description: 'Content readable at 320px wide without horizontal scroll' },
    ],
  },
  {
    id: 'tables',
    name: 'Tables',
    colorClass: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/25 dark:text-teal-300 dark:border-teal-700',
    headerBg: 'bg-teal-50 dark:bg-teal-900/10',
    accentBorder: 'border-t-2 border-t-teal-400 dark:border-t-teal-600',
    checks: [
      { id: 'table_headers',   name: 'TH + scope',     description: '<th> used with correct scope attribute' },
      { id: 'layout_tables',   name: 'Layout table',   description: 'Layout tables use role="presentation" so AT ignores them' },
      { id: 'no_nested_tables', name: 'No nesting',    description: 'Tables are not nested inside other tables' },
    ],
  },
  {
    id: 'metadata',
    name: 'Metadata',
    colorClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/30 dark:text-slate-300 dark:border-slate-600',
    headerBg: 'bg-slate-50 dark:bg-slate-800/30',
    accentBorder: 'border-t-2 border-t-slate-400 dark:border-t-slate-500',
    checks: [
      { id: 'viewport',        name: 'Viewport scale', description: 'meta viewport does not disable user scaling' },
      { id: 'meta_page_title', name: 'Title tag',      description: 'Page title is present, unique, and descriptive' },
      { id: 'no_auto_refresh', name: 'No auto-refresh', description: 'No meta refresh or redirect tags' },
    ],
  },
]

export const ALL_CHECKS = CATEGORIES.flatMap(c => c.checks)

export const STATUS_CYCLE = ['not-started', 'pass', 'fail', 'in-progress', 'na']

export const STATUS_CONFIG = {
  'not-started': { label: 'Not started', dot: 'bg-gray-300 border border-gray-400 dark:bg-gray-600 dark:border-gray-500', text: 'text-gray-400 dark:text-gray-500' },
  'pass':        { label: 'Pass',        dot: 'bg-green-500',                                                               text: 'text-green-700 dark:text-green-400' },
  'fail':        { label: 'Fail',        dot: 'bg-red-500',                                                                 text: 'text-red-700 dark:text-red-400' },
  'in-progress': { label: 'In progress', dot: 'bg-amber-400',                                                               text: 'text-amber-700 dark:text-amber-400' },
  'na':          { label: 'N/A',         dot: 'bg-gray-400 dark:bg-gray-500',                                               text: 'text-gray-500 dark:text-gray-400' },
}

export const cn = (classNames: (string | boolean | undefined)[]) => classNames.filter(Boolean).join(' ')

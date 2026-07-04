export function inputClasses(dense = false) {
  return dense
    ? 'w-full rounded-[10px] border border-[#dcdcdc] bg-white px-3 py-2 text-[0.85rem] text-text transition focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-light'
    : 'w-full rounded-sm border border-border bg-white px-[14px] py-3 text-[0.95rem] text-text transition focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-light';
}

export const labelClasses = 'mb-1.5 block text-[0.88rem] font-semibold text-text';

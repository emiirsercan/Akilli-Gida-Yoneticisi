export function foodKind(name: string) {
  const text = name.toLocaleLowerCase('tr-TR');
  if (/süt|yoğurt|ayran|kefir/.test(text)) return 'milk';
  if (/yumurta/.test(text)) return 'egg';
  if (/avokado/.test(text)) return 'avocado';
  if (/havuç/.test(text)) return 'carrot';
  if (/ekme[kğ]|(?:^|\s)un(?:\s|$)|makarna|pirinç/.test(text)) return 'bread';
  if (/peynir|kaşar/.test(text)) return 'cheese';
  if (/domates|biber|elma|çilek/.test(text)) return 'tomato';
  return 'greens';
}
export function FoodArt({ name, className = '' }: { name: string; className?: string }) {
  const kind = foodKind(name);
  return <svg className={`food-art ${className}`} viewBox="0 0 120 120" fill="none" aria-hidden="true">
    {kind === 'tomato' && <><ellipse cx="61" cy="77" rx="36" ry="29" fill="#e67c55"/><ellipse cx="48" cy="70" rx="19" ry="22" fill="#f49b70"/><path d="m61 54-20-12 16 1 5-15 5 15 16-4-13 15-9 6Z" fill="#4b704a"/><path d="M63 45q-1-14 8-20" stroke="#325b3d" strokeWidth="5" strokeLinecap="round"/><path d="M35 70q0-7 7-11" stroke="#ffd7ae" strokeWidth="4" strokeLinecap="round"/></>}
    {kind === 'avocado' && <><path d="M60 17c-12 0-15 17-22 29-10 17-19 25-17 41 3 35 75 34 78 0 2-16-8-26-18-43-6-11-10-27-21-27Z" fill="#315a3b"/><path d="M60 25c-9 0-11 16-18 28-10 16-17 24-14 36 5 25 61 25 65-1 2-12-5-22-15-38-7-12-9-25-18-25Z" fill="#bad087"/><path d="M60 34c-6 0-9 15-15 25-9 16-11 22-9 31 5 18 44 17 48-1 3-11-3-21-10-33-6-11-8-22-14-22Z" fill="#e5e7ad"/><ellipse cx="60" cy="80" rx="18" ry="21" fill="#a87544"/><ellipse cx="55" cy="75" rx="10" ry="14" fill="#bd9160"/></>}
    {kind === 'milk' && <><path d="m40 35 12-16h25l10 16v70H40V35Z" fill="#f9f6e9"/><path d="M40 35h47v15H40zM40 87h47v18H40z" fill="#84a8b2"/><path d="m52 19 7 16h28L77 19H52Z" fill="#b9d3d6"/><path d="M40 35h19v70H40z" fill="#e1e7de"/><path d="M40 35h19v15H40zM40 87h19v18H40z" fill="#608b95"/><path d="M73 58c-1 0-9 9-9 15a9 9 0 0 0 18 0c0-6-8-15-9-15Z" fill="#84a8b2"/></>}
    {kind === 'egg' && <><ellipse cx="60" cy="95" rx="39" ry="10" fill="#d5c2a0" opacity=".5"/><path d="M60 18C43 18 28 59 28 77c0 35 64 35 64 0 0-18-15-59-32-59Z" fill="#e4c69e"/><path d="M58 22C44 28 35 60 35 75c0 24 24 28 32 24-39-7-12-67-9-77Z" fill="#f3dfbd"/></>}
    {kind === 'carrot' && <><path d="M60 41Q40 22 45 11q16 7 20 26M66 38q0-27 16-29 0 20-16 29M69 41q19-25 30-15-9 17-30 15" fill="#527a44"/><path d="M45 44c7-10 25-8 34 1 14 14-29 59-40 62-5-11-7-50 6-63Z" fill="#e9994e"/><path d="m47 53 10 7M41 70l9 5M44 87l5 2M66 58l7 4" stroke="#be713f" strokeWidth="3" strokeLinecap="round"/></>}
    {kind === 'bread' && <><path d="M25 97V56c-12-2-12-24 0-30 18-10 52-10 69 2 11 9 6 25-4 27v42H25Z" fill="#b47e46"/><path d="M34 89V50c-14 0-12-17-2-21 15-7 39-6 51 3 8 6 5 16-3 18v39H34Z" fill="#ead0a0"/><circle cx="48" cy="49" r="3" fill="#d4b581"/><circle cx="67" cy="65" r="4" fill="#d4b581"/></>}
    {kind === 'cheese' && <><path d="m23 63 46-33 29 47-54 24-21-38Z" fill="#e6b958"/><path d="m23 63 51 10 24 4-54 24-21-38Z" fill="#f4d78a"/><path d="m23 63 46-33 5 43-51-10Z" fill="#f6df9a"/><ellipse cx="56" cy="54" rx="6" ry="5" fill="#d7a74c"/><ellipse cx="44" cy="82" rx="5" ry="4" fill="#d7a74c"/><ellipse cx="72" cy="81" rx="7" ry="4" fill="#d7a74c"/></>}
    {kind === 'greens' && <><path d="M60 102V51" stroke="#486e40" strokeWidth="5" strokeLinecap="round"/><path d="M60 74C21 84 15 50 25 35c23-2 39 8 35 39Z" fill="#78955c"/><path d="M60 88c39-3 48-32 35-46-25 2-40 18-35 46Z" fill="#4f764c"/><path d="M60 59C39 39 49 15 66 12c17 16 14 34-6 47Z" fill="#93aa6d"/><path d="m60 74-26-28M62 87l23-31M61 56l4-30" stroke="#c5d0a5" strokeWidth="2" strokeLinecap="round"/></>}
  </svg>;
}

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
export const fieldClass = 'w-full bg-[#f3f3f8] rounded-lg py-2.5 px-3 text-[15px] outline-none focus:ring-2 focus:ring-[#0058bc]';
export const buttonClass = 'bg-[#0058bc] hover:bg-[#004493] text-white px-4 py-2.5 rounded-lg text-[13px] font-medium disabled:opacity-50';
export const cardClass = 'bg-white rounded-xl p-6 border border-[#e2e2e7] shadow-sm';
export function Notice({ error, children }) {
  return <p role={error ? 'alert' : 'status'} className={'text-[13px] p-3 rounded-lg mb-4 ' + (error ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#f3f3f8] text-[#414755]')}>{children}</p>;
}
export function Modal({ title, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return <dialog ref={ref} onCancel={onClose} aria-label={title} className="m-auto w-[calc(100%-2rem)] max-w-3xl max-h-[90dvh] overflow-y-auto rounded-xl border border-[#e2e2e7] bg-[#f9f9fe] p-0 text-[#1a1c1f] shadow-2xl backdrop:bg-black/50">
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[#e2e2e7] bg-white px-6 py-4">
      <h2 className="text-[22px] font-bold">{title}</h2><button type="button" onClick={onClose} aria-label="Close" className="p-2 rounded-full hover:bg-[#f3f3f8]"><X size={22} /></button>
    </header><div className="p-6">{children}</div>
  </dialog>;
}
export function Field({ label, children }) {
  return <label className="block text-[13px] font-medium text-[#414755] mb-3"><span className="block mb-1">{label}</span>{children}</label>;
}

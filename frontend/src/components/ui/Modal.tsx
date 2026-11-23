import type { ReactNode } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { X } from "lucide-react";

interface Props {
  show: boolean;
  onHide: () => void;
  /** Se llama al terminar la animación de salida (equivale a onExited de react-bootstrap) */
  onExited?: () => void;
  title: string;
  children: ReactNode;
}

export const Modal: React.FC<Props> = ({ show, onHide, onExited, title, children }) => (
  <Transition show={show} afterLeave={onExited}>
    <Dialog onClose={onHide} className="relative z-50">
      <TransitionChild
        enter="transition-opacity duration-200"
        enterFrom="opacity-0"
        leave="transition-opacity duration-150"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-slate-900/50" aria-hidden="true" />
      </TransitionChild>
      <div className="fixed inset-0 flex items-start justify-center overflow-y-auto p-4 sm:pt-16">
        <TransitionChild
          enter="transition duration-200"
          enterFrom="opacity-0 -translate-y-4"
          leave="transition duration-150"
          leaveTo="opacity-0 -translate-y-4"
        >
          <DialogPanel className="w-full max-w-lg rounded-xl bg-white shadow-soft">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
              <button
                type="button"
                onClick={onHide}
                aria-label="Cerrar"
                className="cursor-pointer rounded-lg p-1 text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-accent-500"
              >
                <X />
              </button>
            </div>
            <div className="p-5">{children}</div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </Transition>
);

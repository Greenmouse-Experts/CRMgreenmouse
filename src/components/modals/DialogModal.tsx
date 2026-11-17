import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import { Toaster } from "sonner";
import { X } from "lucide-react";

interface ModalProps extends PropsWithChildren {
  actions?: any;
  actionName?: string;
  title?: string | ReactNode;
  maxWidth?: string;
  onClose?: () => void;
}

export interface ModalHandle {
  open: () => void;
  close: () => void;
}

const Modal = forwardRef<ModalHandle, ModalProps>(
  ({ children, actions, title, maxWidth, onClose }, ref) => {
    const modalRef = useRef<HTMLDialogElement>(null);

    useImperativeHandle(ref, () => ({
      open: () => {
        modalRef.current?.showModal();
      },
      close: () => {
        modalRef.current?.close();
      },
    }));

    return (
      <dialog ref={modalRef} className="modal modal-middle sm:modal-middle">
        <Toaster theme="dark" richColors />
        <div
          className={`modal-box ${
            maxWidth || "max-w-4xl"
          } w-full flex flex-col max-h-[90vh] p-6 rounded-lg shadow-xl relative`}
        >
          <div className="flex items-center">
            {title && (
              <div className="font-semibold text-lg text-base-content">
                {title}
              </div>
            )}
            <form method="dialog" className="ml-auto">
              <button
                type="button"
                className="btn btn-sm btn-circle btn-ghost text-gray-500 hover:text-gray-700"
                onClick={() => {
                  modalRef.current?.close();
                  onClose?.();
                }}
              >
                <X size={20} />
              </button>
            </form>
          </div>
          {children && <div className="my-3">{children}</div>}
          {actions && <div className="ml-auto">{actions}</div>}
        </div>
      </dialog>
    );
  },
);

Modal.displayName = "Modal";

export default Modal;

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

export default function Popup({
  open,
  setOpen,
  title,
  message,
  type = "info",
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  message: string;
  type?: "success" | "error" | "info";
}) {
  const colors =
    type === "success"
      ? "text-green-600"
      : type === "error"
      ? "text-red-600"
      : "text-indigo-600";

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <Dialog.Panel className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <Dialog.Title
                className={`text-xl font-bold mb-2 ${colors}`}
              >
                {title}
              </Dialog.Title>
              <Dialog.Description className="text-gray-700">
                {message}
              </Dialog.Description>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  OK
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
